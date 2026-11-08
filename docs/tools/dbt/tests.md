# Tests

From my practical experience 90%-95% of tests in a dbt project never fail. The more mature an organisation, the higher this % - for obvious reasons (mature processes, less frequent changes, etc.).

This doesn't mean that these tests are useless. The best way to explain is using a [metaphor](https://sites.google.com/site/unclebobconsultingllc/architecture-is-a-second-order-effect?utm_source=chatgpt.com&pli=1&authuser=0) by Robert C. Martin:

> What if you had a button? If you push this button a little light instantly turns red or green. Green means your system works. Red means it’s broken. If you had a button like this, you could make small changes to the system, and prove that they didn’t break anything. I have a button like that! It’s called a test suite. I can run it any time I like, and within seconds it tells me, with very high certainty, that my system works.

## Test to model ratio

There is no optimal test to model ratio. 

The minimum is 1 (each model should have at least 1 test for primary key).

From my experience the ratio at start-up/scale-up is hovering above ~1 for a long time.

In large enterprises it is between 5 and 15.

## Not null test optimisation

In large dbt projects running thousand of not null tests becomes expensive because every test is its own query. The way to speed this up is to declare all these not null tests at model level, so they will run in a single test.

```yaml
models:
  - name: stg_foo__bar
    data_tests:
      - not_null_columns:
          name: not_null_columns_stg_foo__bar
          arguments:
            columns:
              - col1
              - col2
              - col3
    columns:
      - name: col1
      - name: col2
      - name: col3
```

This will run as a single test in the warehouse. 

```sql
select
    count(*)
from 
    stg_foo__bar
where
   col1 is null
   or col2 is null
   or col3 is null
```

It will be less obvious which column has actual nulls if the test fails. But a big performance boost is gained in case of 100s of columns being tested. But do keep in mind, that majority of tests never fail, so the trade-off is worth it.