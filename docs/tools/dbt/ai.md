# AI with dbt

My experience with AI (in context of dbt projects) is really varied - there were good things, bad things and inconsistent things.

## Where AI is useful
- Code understanding - imagine you inherit a codebase with 10k SQL of dbt models and no docs. Back in the old days, it would take you a lot of time to understand what was going on. With AI, any question about the code/setup can be answered quickly (and in majority of cases correctly).
- PR reviews - it can catch a lot of indirect effects (beyond simple code references) and edge cases, even if your CI pipeline is green.
- Migration skills - specifying reproducible steps to migrate scripts from legacy system to a dbt workflow.
- Investigation skills - specifying steps to take to investigate a failing test or an alert. dbt Labs have a great [example](https://mcpmarket.com/tools/skills/dbt-job-error-diagnostics) (specific to dbt Cloud platform).

## Where AI is useless
- Deep layers of SQL logic - AI stops comprehending what is going on, even with frontier models.
- Where the work is to gather the requirements from stakeholders (often non-technical). For example:
  - You need to automate regulatory reporting for a bank for new legislation that will be implemented as a new feature in the lending/CRM system.
  - This modelling work will involve a lot of coordination with lawyers (who understand the legislation) and engineers/product managers (who are implementing the new feature to comply with the new legislation).
  - The first task is to wrap your head around how the new feature will work, what new data is going to be produced, what will change, etc.
  - AI can't help with this.

## Where AI is inconsistent
- Code generation - Sometimes it will one-shot a big change without any errors. Sometimes it will make basic mistakes e.g. using `LEFT JOIN` instead of `INNER JOIN` instead of and then getting puzzled by unexpected NULLs.