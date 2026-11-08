# Theory vs Practice

Things that are great in theory but are not in practice.

## dbt-docs

Unfortunately, from my experience nobody uses the dbt docs site. Engineers read docs in yaml from their IDE. Users... well users don't read docs at all.

dbt docs experience is currently being [redesigned](https://github.com/dbt-labs/dbt/discussions/13080) and I have high hopes for it. Column lineage feature in particular may make DataHub redundant and can be the killer feature that brings people to the dbt docs site.

## dbt State

[dbt State](https://docs.getdbt.com/docs/deploy/dbt-state-about?version=2) is making dbt builds smarter by rebuilding only when data or code has changed. It is a proprietary feature and the pricing is explained [here](https://docs.getdbt.com/docs/platform/billing/dbt-state-usage?version=2).

Illustrative example (as of October 2026) for:
- 1000 unique models
- 5000 unique tests

The DATT (unique models + unique tests) = 6000. 

Cost per month = 6000 x $0.094 x 30  = $564 per month
Cost per year = $564 × 12 = $6,768 per year

Doesn't sound a lot. But the docs have a cheeky wording. 

> cost per billing period using the unit price (USD $0.094) x **sum** of daily active target tables (DATT)

The sum part may mean that final prices are x30:

Cost per month = $564 x 30 = $16,920
Cost per year = $16,920 x 12 = $203,040

AI tools seem to agree that the wording requires to multiply DATT x 30. And at this price the feature is just too expensive...

## Elementary

[Elementary](https://github.com/elementary-data/elementary) generates an observability report. This report includes model/test history metadata, including failed test history.

Although the UI is really impressive, from practical experience of using Elementary for ~6 months on a dbt project with 1k models and 5k tests (with ~100 users), there are 2 main problems:

1. It is [very slow](https://github.com/elementary-data/elementary/discussions/786) - this is because metadata get's written to the same warehouse. Elementary was running for 30+ minutes (when a full rebuild of the project took only ~10 mins). When self-hosting, it takes another 10 minutes to produce site artefacts.
2. It has no practical value - Nobody used it. Because why would they? In mature environments, [test rarely fail](./tests.md) and when they do, they would generate an alert that would be promptly resolved. And nobody really cares how many times a specific test failed in the past, no matter how sleek the UI is.