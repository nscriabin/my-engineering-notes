---
sidebar_position: 2
toc_max_heading_level: 5
---
# Terraform

## Pre-commit

Pre-commit hooks work great with terraform locally. 2 specific hooks:
- `terraform fmt`
- `tflint`

To set pre-commit hooks:

1. Install terraform.

It is recommended to use [tfenv](https://github.com/tfutils/tfenv). tfenv can be used to manage multiple versions of terraform. Since the hooks will use only `fmt` command, `latest` version will do:

```sh
tfenv install latest
tfenv use latest
```

2. Install [tflint](https://github.com/terraform-linters/tflint).
3. Install [pre-commit](https://github.com/pre-commit/pre-commit).
4. Install the githooks.

Run `pre-commit install` to install the githooks into .git/hooks.

To modify the hooks modify the `.pre-commit-config.yaml`

## S3

There are a lot of open-source [terraform modules](https://registry.terraform.io/modules/terraform-aws-modules/s3-bucket/aws/latest) for creating S3 buckets. Don't re-invent the wheel.

## Snowflake 

Snowflake has an [official terraform provider](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs)

When using it, it is best to organise the files are organised around the main concepts in Snowflake:

- Databases
- Schemas
- Tables
- Views
- Task

### Setup

#### Terraform user

There must be a dedicated Terraform user created in the Snowflake account. 

The authentication for this user must be handled with a [key pair authentication](https://docs.snowflake.com/en/user-guide/key-pair-auth), since it provides better security than basic password authentication. 

The private key must added to the GitHub terraform repo secrets and passed to the terraform provider as an environment variable during CI/CD stage.

#### Role setup

##### Roles used by the terraform user

Following the [best practices](https://docs.snowflake.com/en/user-guide/security-access-control-considerations), the terraform user will be using 2 roles to create resources:

1. `SECURITYADMIN` role – for creating/modifying users/roles.
2. `SYSADMIN` role – for creating everything else – warehouses, databases, tables, views, etc.

##### Custom roles

Any custom roles created must be assigned to the `SYSADMIN`, so that terraform user using the `SYSADMIN` [inherits](https://docs.snowflake.com/en/user-guide/security-access-control-overview#role-hierarchy-and-privilege-inheritance) any permissions granted to these custom roles.

This is necessary so that terraform user can manage resources created by the custom roles e.g. if a user creates a database/schema via the UI using a custom role, the terraform user should be able to create tables/views inside that database/schema. Without the role assignment, the terraform user won’t be able to do it.

Now, obviously there is an argument that custom roles shouldn’t be able to create any database/schemas via the UI in the first place. But during migration to terraform, there is a very liberal setup of roles and permissions. Furthermore, a lot of existing Snowflake assets are already created by custom roles in the UI, so the terraform user needs the permissions to manage them.

In long term, only the terraform user must have the permission to create
majority of Snowflake assets.

##### Database Roles

[Database roles](https://docs.snowflake.com/en/sql-reference/snowflake-db-roles) is a relatively new concept, introduced in November 2023.

They are only needed for largest of scales or in environments that have the most stringent access requirements.

#### Snowflake resource import into Terraform

There are lots of tutorials on how imports into terraform work (including an [official](https://developer.hashicorp.com/terraform/cli/import) one).

If there is a Dev account, that is a good opportunity to safely practice the procedure. This would involve creating something in Snowflake UI and then adding the relevant terraform resources. 

N.B. Removing the `import` resource is not a necessity but does keep the codebase clean.

An alternative strategy (to importing resources) is to delete the resource in the UI and simply re-create it in terraform. This is a good option for resources that are not frequently used by users e.g. views which are queried once per month for the end of month report.

##### Preview resources

Some resources in the terraform snowflake provider are in the [preview stage](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs#a-list-of-preview-and-stable-resources-and-data-sources) – that means they are not stable and can have breaking changes between minor version updates.

Unless you want to "live on the edge" it is best to not use them. It is more prudent to wait until these become stable.

##### Import order 

Importing of resources can be done in any order. 

But the most logical is to start from the top level resources e.g. warehouses, of which there should be a few. And proceed to bottom level ones e.g. views, of which there might be hundreds

The order:
- Warehouses
- Database
- Schemas
- Views
- Tasks
- Streams on Tables

:::info
Schemas, tables and views can be created with [dbt](https://github.com/dbt-labs/dbt). Creating and managing these via terraform is possible but not ideal.
:::

Roles and Users is the messiest part:
- If Roles and Role grants have been provided via the UI - it will take a while to untangle.
- Users are usually provisioned by an IT team and integrated with the org's SSO. So the import of these may require some coordination.

#### Comment field

There is an option to specify column description aka [comment](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs/resources/view#comment-6) for some resources e.g. views. This means that the description will appear directly in Snowflake.

This is useful for setup that don't have a standalone data catalog implemented.

This feature can be used for the most important views/tables. And not for all columns.

It is also possible to use variables in Terraform to re-use these descriptions across multiple tables, views, etc.

#### Privilege grants

The syntax for privilege grants to roles can be [confusing](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs/resources/grant_privileges_to_account_role). 

The best strategy to minimise these grants is to provision as many grants as possible at the database level first, then at the schema level, utilising the [future](https://docs.snowflake.com/en/sql-reference/sql/grant-privilege#future-grants-on-database-or-schema-objects) functionality. This way future schemas, tables, views, etc. will inherit these permissions automatically.

### Large SQL files

If a resource e.g. a view has a lot of underlying SQL code it is better to store it in the `.sql` file. The contents of the file can then be read using the [file](https://developer.hashicorp.com/terraform/language/functions/file) function and referenced in the terraform resource.

:::warning
Every single resource which will read a file, will read it at runtime. At some point it may become a bottleneck. But this setup works well initially.
:::

Only those resource where the contents of the .sql have changed will be updated during the apply phase.

The `.sql` file convention must follow `{asset type}__{database}__{schema}__{asset name}.sql`, for example:

`view__example_db__example_schema__example_view.sql`

### Non-obvious things

#### Terraform resource dependencies

Using the id’s of a parent resource as an input to child resource will create a natural dependency. This will ensure that resources are created in the correct order.

For example, passing [database resource](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs/resources/database) id (which is simply the database name) as an input to the database parameter into [schema resource](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs/resources/schema), will ensure that the database is created before the schema is created inside the database. Without this dependency, terraform may attempt to create the schema before the database, causing an error, since the database doesn’t exist yet.

This method doesn’t work with all resources. In some cases the id of the resource will mean a completely different thing e.g. you would expect the id of a [schema resource](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs/resources/schema) to be the schema name but in reality it also contains the database name. In such cases, it is better to hard-code the value in the child resource and set an explicit [depends_on](https://developer.hashicorp.com/terraform/language/meta-arguments/depends_on) parameter.

#### Object does not exist or not authorized.

If in the process of importing a Snowflake resource to terraform, the plan is giving a generic `-1 error`, with the error message:

`Error: [errors.go:23] object does not exist or not authorized`

and you are sure that the object exists. Then this issue is with terraform user role permissions. 

Check what Role is owning the resource in Snowflake. This can be done in the UI. 

Ensure that this role is assigned to `SYSADMIN` role (since `SYSADMIN` is the role used by the terraform user). This can also be done in the UI.

If the role isn’t assigned to `SYSADMIN`, assign it (using `ACCOUNTADMIN` role). The below can be executed in the Snowflake UI:

`GRANT ROLE <ROLE-NAME> TO ROLE SYSADMIN;`

Or alternatively, this can also be granted with the terraform resource [grant_account_role](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs/resources/grant_account_role).

#### Snowflake view copy grants

Snowflake view terraform resource has a really useful option – [copy_grants](https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs/resources/view#copy_grants-1), which will copy grant permissions every time the view is recreated (by terraform following any changes).

Without it, users may lose the permissions during migration to Terraform.