# Deployment

There are multiple ways to deploy and run a dbt project.

## Native dbt Cloud integration

dbt Cloud provides [many ways](https://docs.getdbt.com/docs/deploy/jobs?version=2) on how to trigger dbt model builds.

It is seamless and great until you reach a certain scale. In October 2024, dbt Labs [released some data](https://www.getdbt.com/blog/analytics-engineering-next-step-forwards) about their client usage of dbt - and 95% of clients have `<5k` models.

There are 2 downsides to using dbt Cloud at scale:
1. It is a proprietary SaaS product - meaning you are the mercy of vendor for [price spikes](https://www.getdbt.com/blog/dbt-cloud-package-update) but unlike with a SaaS version of an open source project - you can't migrate to a self hosted version when pricing becomes unsustainable.
2. There are better and cheaper tools that allow you to orchestrate a dbt project at scale. 

## GitHub Actions

If you are a start-up/scale-up with a tight budget. There is an incredibly simple way to run your dbt project.

A single full dbt build of the whole project once per day (at the end of the day) in GitHub Actions (GHA) as a scheduled run. Shocking but... it works.

Don't convince yourself that analytical data is needed at real time frequency at a start-up. It is not.

I've seen this method work for projects even with 1k models. But it is a temporary solution.

:::warning
GHA is not an orchestrator (like Airflow) and if you start introducing multiple runs per day, you will quickly discover that GHA [doesn't guarantee](https://github.com/orgs/community/discussions/158356) the schedule e.g. a scheduled run every 2 hours, may run every 3 hours.
:::

### Moving to an orchestrator

If your firm has an orchestrator in use (Airflow, Prefect, Dagster), a simple quality of life improvement is to lift and shift a full rebuild from [GHA](#github-actions) to the orchestrator.

This way, the builds will at least run on the guaranteed schedule.

## cosmos package

There is a natural integration of dbt with Airflow via the [cosmos package](https://github.com/astronomer/astronomer-cosmos).

:::info
Industry veterans may remember that cosmos package grew from the [idea](https://www.astronomer.io/blog/airflow-dbt-1/) of parsing dbt DAGs and mapping these into Airflow DAGs. Early users, maintained their own private libraries which were similar to cosmos.
:::

:::info
Dagster has a similar dbt integration package - [dagster-dbt](https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-dbt). As of October 2026, no such integration package exists for Prefect. 
:::

Cosmos requires Airflow to be set-up and used within the firm + an infrastructure layer (most easily with k8s).

The added benefit of this setup, is that all your Data Platform is consolidated around a single orchestrator - Airflow.

Surprisingly there are not many blogs posts elaborating on the full setup. The only one I found is by [Get Your Guide](https://www.getyourguide.careers/posts/airflow-dbt-leveraging-astronomer-cosmos-at-getyourguide).

But from my personal experience there are 2 ways of doing cosmos.

### Scheduled DAGs based on tags

This works by tagging each model with frequency you want it to run e.g. every hour, every 2 hours, once per day at 6pm, etc.

Airflow DAGs would be then generated using cosmos package based on these [tags](https://astronomer.github.io/astronomer-cosmos/guides/translate_dbt_to_airflow/selecting-excluding.html#using-select-and-exclude) (or [selectors](https://astronomer.github.io/astronomer-cosmos/guides/translate_dbt_to_airflow/selecting-excluding.html#using-selector) combining tags).

It is easy to get started with - you just need to tag all root models.

But it is still a schedule based approach without the complete integration.

### Complete integration

The complete integration would happen when upstream DAGs in Airflow which produce data are linked to dbt source tasks via [sensors](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/sensors.html#), triggering the necessary dbt branches dynamically. This is the approach taken in the [Get Your Guide](https://www.getyourguide.careers/posts/airflow-dbt-leveraging-astronomer-cosmos-at-getyourguide) setup.

Same outcome could be achieved with [assets](https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/assets.html) in a slightly cleaner way.

The problem with both sensors and assets is that if an upstream Airflow DAG completes (without actually inserting/changing data), the downstream dbt models will run without any new data/changes. But from my practical experience 
this happens rarely.

## Source freshness approach

Another way to build your dbt project (in an orchestrator or elsewhere) is to use [source freshness](https://docs.getdbt.com/reference/resource-configs/freshness) as a starting point.

1. Define freshness criteria for each source
2. Run `dbt freshness` for all sources every x minutes/hours
3. Rebuild all models downstream of sources that have fresh data

This is effectively what [dbt State](https://www.getdbt.com/product/dbt-state) does.

The downside of this approach is that you still need to run `dbt freshness` on a schedule and at certain scale, you will end up running it very frequently e.g. every 2 minutes.