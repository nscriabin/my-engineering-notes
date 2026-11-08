# Local Setup

## Verifying setup

To run Python/Prefect commands from your uv virtual environment:

- Prefix commands with `uv run` (e.g. `uv run prefect version`)
- Or run `source .venv/bin/activate` once before running any prefect commands.
- Some IDEs (e.g. VS Code) auto-detect the uv environment. This means that if you are using the terminal inside the IDE you don't need to use either `uv run`. Python/Prefect commands will work automatically. 

Run `uv run prefect version` to verify that everything was setup correctly.

## Configure local profile

If this is your first time setting up a prefect repo, you will need to create a profile. Execute the below commands:

```sh
prefect profile create local
prefect profile use local
```

Run `prefect config view`, it should show:

```
PREFECT_PROFILE='local'
PREFECT_API_URL='http://127.0.0.1:4200/api' (from profile)
```

The `PREFECT_API_URL` should automatically get set. If not, then run:

```sh
prefect config set PREFECT_API_URL=http://127.0.0.1:4200/api
```

### Compatibility with older Prefect versions

If you use older Prefect versions (`<v3`) and the new versions (`>=v3`) then add the below line 

```
PREFECT_API_DATABASE_MIGRATE_ON_START = "False"
```

to `~/.prefect/profiles.toml`:

```
active = "local"

[profiles.local]
PREFECT_API_URL = "http://127.0.0.1:4200/api"
PREFECT_API_DATABASE_MIGRATE_ON_START = "False"
```

This ensures compatibility between different Prefect versions sharing the same local metadata DB.

Without this flag you may encounter, you won't be able to use prefect (locally) in any of the repos. When you will run `prefect server start`, you will encounter an error referencing:

```
alembic.util.exc.CommandError: Can't locate revision identified by ...
```

## Running flows locally

1. Run `prefect server start` and open `http://127.0.0.1:4200/` in a browser.
2. Run your Prefect flows by executing the .py file from the command line (in another terminal window) e.g. `python flows/examples/flow.py`.

:::info
If flows don't get displayed on your local server's Dashboard/Run page, restart your local server.
:::

## Common package

To run a flow that uses functions from the [common package](./standards.md#common-package), you need to adjust your `PYTHONPATH`.

<details>
<summary>Mac/Linux</summary>

Add the below line to your `.zshrc`:

```sh
export PYTHONPATH="/path/to/repo/flows:$PYTHONPATH"
```

</details>

<details>
<summary>Windows</summary>

In Powershell, execute:

```powershell
$old_python_path = [System.Environment]::GetEnvironmentVariable("PYTHONPATH", "User")
$new_python_path = "path\to\repo\flows;" + $old_python_path
[System.Environment]::SetEnvironmentVariable("PYTHONPATH", $new_python_path, "User")
```

</details>

:::info
If you are executing the above commands in a VS Code terminal, restart VS Code for the changes to take effect.
:::

## Connecting to Snowflake

If you want to run flows that connect to Snowflake locally:

1. Locate the `Snowflake Credentials` Block in the blocks section of the local prefect server and
   1. Edit the `User` value to your Snowflake username.
   2. Edit the `Role` value to match a role that your Snowflake user can assume. 
   3. For `Authenticator` either select `externalbrowser`, or `snowflake_jwt` if you have a [private/public key pairing](https://docs.snowflake.com/en/user-guide/key-pair-auth) associated with your Snowflake account.
2. Create a `Snowflake Connection` block in the local prefect server. 
   1. Point this towards your Credentials Block
   2. Set the desired Snowflake Warehouse, Database and Schema.

It is best to have a common function from a [common package](./standards.md#common-package) to load a default connection block. Then you can create a block with the same name locally. This function should also have an option to pass the name of another block (which must exist locally).

## Connecting to S3

When running flows that interact with S3, locally, by default these will not work. There are 2 ways to make them work:

1. Use AWS CLI with an SSO role – Recommended.
2. Use AWS Access keys.

### Using AWS CLI

If you have configured [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html), you can set the profile corresponding to the AWS account in which you want to access the S3 bucket, as the [AWS_PROFILE](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html#cli-configure-files-using-profiles) env variable.

Then before executing the flow, you simply run the following command:

```sh
aws sso login --profile your-profile-name
```

:::info
If `AWS_PROFILE` is not set or is set incorrectly, this method will not work. Since it will be the profile specified in the `AWS_PROFILE` that will be passed to `boto3` by default.
:::

### Using access keys

Alternatively, if you haven’t setup the AWS CLI, you can add 3 extra parameters to each `boto3.client()` function used in the flow:

- `aws_access_key_id`
- `aws_secret_access_key`
- `aws_session_token`

These values can be obtained from the `AWS Access Portal` and depending on the setup of AWS in the org these can stay valid between hours and months. 


```python
s3_client = boto3.client(
    service_name="s3",
    aws_access_key_id="...",
    aws_secret_access_key="...",
    aws_session_token="...",
)
```

:::warning
Never commit these keys/tokens to the repo. These must only be used in the local testing. You can always set these values as env variables and access them with os.getenv().
:::

### Bucket access

Some orgs restrict access to AWS from local environment completely. In this case, end-to-end testing can only be done in dev environment.

Some orgs allow some human roles to have read and write permissions to many S3 buckets across. In this case, end-to-end testing can be done locally.

:::warning
In case of local write access to buckets in production accounts, make sure that you don’t accidentally delete files. Double check everything. With great power comes great responsibility.
:::

## Recreating blocks locally

You can re-create any block from Prefect Cloud locally by getting majority of information from Prefect Cloud UI.

To retrieve the value of any secret blocks, follow this [procedure](./prefect-cloud.md#getting-secret-values).

:::warning
Avoid re-creating and using blocks linked to service accounts. Locally, you must use your local credentials (where possible). This helps monitoring applications distinguish traffic between local users and service accounts, without relying on IPs.
:::

### Adding deployments

Deployments must be added in `prefect.yaml`, if the project is using [yaml based deployments](./setup-decisions.md#yaml-based-deployments).

If [only changed flows are deployed](./setup-decisions.md#deploying-only-changed-flows), ensure that the file containing the flow contains changes. If you are only changing deployment settings in `prefect.yaml` then simply add a comment line file containing the flow, to trigger a redeployment.

Following [standards](./standards.md#file-organisation), ensure that you the file containing the flow is named `flow.py` or is ending with `_flow.py`. And store this file in the `flows/` directory.

:::warning
There must be no `/` in Deployment names. Although `/` is not a special character in yaml, it is a special character in Prefect. In Prefect, a deployment is uniquely identified as `<flow_name>/<deployment_name>`. That slash is not just a character – it’s the delimiter between the flow name and the deployment name. Including a `/` in a deployment name, will cause the failure when trying to register the deployment in Prefect Cloud.
:::