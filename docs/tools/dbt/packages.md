# Packages

There are a few dbt packages I found very useful.

## dbt-project-evaluator

[dbt-project-evaluator](https://hub.getdbt.com/dbt-labs/dbt_project_evaluator/latest/) highlights the areas of a dbt project that are misaligned with best practices e.g. having a primary key and an owner defined for each model.

It works well until a certain scale (`~<1k` models), since under the hood the package materialises and runs many things in the warehouse.

At scale a better approach is to rely on tooling which parses the `manifest.json` and applies linting rules without materialising anything in the warehouse. Currently [dbt-score](https://github.com/PicnicSupermarket/dbt-score) and [dbt-bouncer](https://github.com/godatadriven/dbt-bouncer) does this.

Some private implementations of the same idea I have observed, used [polars](https://github.com/pola-rs/polars) for loading the `manifest.json` efficiently.

## dbt-utils

[dbt-utils](https://hub.getdbt.com/dbt-labs/dbt_utils/latest/) is a utilities package and contains macros that can be (re)used across dbt projects.

Practically there are 2 most frequently used macros:
- [date_spine](https://github.com/dbt-labs/dbt-utils/tree/1.4.1/#date_spine-source)
- [unique_combination_of_columns](https://github.com/dbt-labs/dbt-utils/tree/1.4.1/#unique_combination_of_columns-source)

## dbt-audit

[audit_helper](https://hub.getdbt.com/dbt-labs/audit_helper/latest/) is a useful package where you need to provide column/row level differences between versions of a dataset. I found it useful in environments with a formal sign-off process e.g. financial regulatory reporting, where accuracy of data is of highest importance (and can carry large fines).

You execute the audit helper script using 
```dbt show --select script.sql```

The macros are not perfect, so for efficient comparisons a few adjustments are needed. At some point, I will contribute these to the package.

### Column-level comparison

```sql
{% set original_data_set %}
select
    col1,
    col2,
    col3 || '-' || col4 as primary_key_col
from 
    original
{% endset %}

{% set changed_data_set %}
select
    col1,
    col2,
    col3 || '-' || col4 as primary_key_col
from
    changed
{% endset %}

{%- set columns_to_compare = [
    'col1',
    'col2',
] -%}

with all_comparisons as (
    {% for column in columns_to_compare %}
    select {{ loop.index }} as column_order, *
    from (
        {{
            audit_helper.compare_column_values(
                original_data_set,
                changed_data_set,
                primary_key = "primary_key_col",
                column_to_compare = column,
                a_relation_name = "original",
                b_relation_name = "changed"
            )
        }}
    )
    {% if not loop.last %} union all {% endif %}
    {% endfor %}
)

select
    column_name,
    match_status,
    count_records,
    percent_of_total
from all_comparisons
order by column_order, count_records desc
```

### Row-level comparison

```sql
{% set original_data_set %}
select
    col1,
    col2,
    col3 || '-' || col4 as primary_key_col
from 
    original
{% endset %}

{% set changed_data_set %}
select
    col1,
    col2,
    col3 || '-' || col4 as primary_key_col
from
    changed
{% endset %}

{%- set columns_to_compare = [
    'col1',
    'col2',
] -%}

with original_data as ( {{ original_data_set }} ),
changed_data as ( {{ changed_data_set }} ),

joined as (
select
    coalesce(original_data.primary_key_col, changed_data.primary_key_col) as primary_key,
    {% for column in columns_to_compare %}
    original_data.{{ column }} as original_data_{{ column }},
    changed_data.{{ column }} as changed_data_{{ column }}{% if not loop.last %},{% endif %}
    {% endfor %}
from 
    original_data

    full outer join changed_data
    on original_data.primary_key_col = changed_data.primary_key_col
),

-- unpivot to one row per (primary key, column); cast to string so the
-- numeric, date and string columns can share a single value column
unpivoted as (
    {% for column in columns_to_compare %}
    select
        primary_key,
        '{{ column }}' as column_name,
        cast(original_data_{{ column }} as string) as value_in_original_data,
        cast(changed_data_{{ column }} as string) as value_in_changed_data
    from joined
    {% if not loop.last %}union all{% endif %}
    {% endfor %}
)

select
    primary_key,
    column_name,
    value_in_original_data,
    value_in_changed_data
from unpivoted
-- is distinct from keeps null-vs-value mismatches, which != would drop
where value_in_original_data is distinct from value_in_changed_data
order by primary_key, column_name
```