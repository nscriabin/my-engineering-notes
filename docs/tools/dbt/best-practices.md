# Best Practices

This doc contains some best practices that are not mentioned in the [dbt Labs best practices](https://docs.getdbt.com/best-practices?version=2).

As well as those that can't be enforced with a linter.

## Naming

To make column types obvious in the code:

- boolean columns should start with `is_`/`has_` e.g. `is_deleted`/`has_feature_a`. Avoid generic `_flag` or adjectives `reversed`.
- date columns should be suffixed with `_date` e.g. `created_date`
- timestamp columns should be suffixed with `_at` e.g. `created_at`. Where the column is a noun use the `_timestamp` suffix e.g. `event_timestamp`. 

## Spelling

Pick either British or American spelling (depending on the main region of the business) and stick with it.

## CTEs

Structure every model as import CTEs, then transformation, then a final select:
- One CTE per source/ref — `select * from {{ ref(...) }}/{{ source(...) }}`, named after what it represents, with filters.
- Transformation logic in later CTEs with descriptive names.
- Reserve `final` for the terminal CTE.

```sql
with foo as (
    select * from {{ ref('foo') }}
    where ...
),

bar as (
    select * from {{ ref('bar') }}
    where ...
),

combined_data as (
    select ...
    from
        foo

        left join bar
        on ..
),

final as (
    select ...
)

select * from final
```

## YAML file organisation

One schema YAML file per model, matching the corresponding `.sql` file name e.g. `foo.sql` and `foo.yml`.

This makes things easier to find. Simply open the corresponding `.yml` file and everything you need is there.

In large projects - having a single YAML file for tens of models in a directory results in a YAML file with several thousands lines, making things hard to find. The problem is aggravated if different models share the same column names.

Source YAML files should stay consolidated i.e. `_source1_sources.yml` - these describe a source system, not an individual model.

## Exceptions from the official recommendations

[Official dbt docs](https://docs.getdbt.com/docs/introduction?version=2) are very good and everyone should read them.

There are however, a few exceptions from the official recommendations. 

### Staging model materialisation

Official dbt docs recommend materialising [staging models](https://docs.getdbt.com/best-practices/how-we-structure/2-staging?version=2) as views.

This recommendation will backfire when:
- Sources are nested JSON fields and views unnest them.
- In addition to above, staging models have a lot of tests.

Tests and downstream models will read the view for each test and downstream model. As you can imagine this can be very expensive - because unnesting of the JSON will happen on each query.

I saw a warehouse bill fall by ~£100k annually when all staging models were moved from views to tables.

### When not to shift left

G-Sheets can be exposed as [external tables in BigQuery](https://docs.cloud.google.com/bigquery/docs/external-data-drive) and declared as dbt sources.

If the "shift left" philosophy is followed, tests would be set on these sources. But this causes Bigquery service to overload.

When external tables are queried (and running tests against them counts as queries), BigQuery accesses the underlying G-Sheets. The limit for concurrent queries in BigQuery on **external tables** is very low — [just 16 concurrent queries](https://docs.cloud.google.com/bigquery/quotas). This failure is transient and goes away on a retry/next build.

A better way is to run the same tests in the corresponding staging model — which simply copies the data from the external table and materialises data as a table not a view!

## Local development

[dbt power user](https://marketplace.visualstudio.com/items?itemName=innoverio.vscode-dbt-power-user) is a VS Code plugin that has 1 killer feature - Cmd/Ctrl + Click on a model/macro name to go to its definition. Speeds up productivity by a lot.

When running models locally - the most efficient way is to use [`--defer` feature](https://docs.getdbt.com/docs/platform/about-defer?version=2) to only build changed models. This required passing current state artefacts, which are usually stored in an object store e.g. S3.