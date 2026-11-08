# Data Pipeline Runbook

This template must be used across all runbooks for data pipelines.

It is meant to make it easier for engineers to debug issues and respond to incidents.

Copy paste this template and store it in the central location, where all runbooks are stored.

Add the link to this newly created document in the place which outputs the alert e.g. Prefect automation.

:::info
This template can be customised depending on the pipeline.
:::

## General structure of the pipeline

Start the runbook with a few lines providing the context of the pipeline. What does it do, what the data is used for? Just a few lines, no more.

Include links to the following:

- Codebase
- Architecture (if the pipeline is quite complex and there are architecture docs/diagrams)
- Data source docs 
  - Template for [API](./data-source-api) data source
  - Template for [S(FTP)](./data-source-s-ftp.md) data source

## [Service-level agreements](https://en.wikipedia.org/wiki/Service-level_agreement) (SLAs)

Check with users by what time they need the data and why. This will help the on-call data engineers determine which issues must be prioritised.

Data quality can also be part of the SLA.

Conversely, there might be no good reason for a SLA e.g. the data is only used in experimental research that is not of high priority. In this case, don’t set an SLA but state this explicitly.

## Alerts

Specify where the alerts are configured. This will be helpful, if engineers will need to change the alerts e.g. if there are some false positives.

## Potential Issues

This is perhaps the most important section of the runbook.

Pipelines issues can fall into 2 groups:

1. Common pipeline errors – these can be found across all pipelines e.g. because of a bug/weird behaviour in an external package.
2. Pipeline specific errors – these are unique to the pipeline in question e.g. because of specific business logic.

For the first group, simply include the below part:

:::info
Refer to [common pipeline errors](./common-data-pipeline-errors.md) for more generic errors.
:::

For the second group, each runbook will have it in a unique way. This section will naturally evolve to a good/clear structure **provided that engineers care about it**.

To be explicit – you must include ways to resolve the second group of issues (if known).

## Contacts

In case there is an issue on the side of an external party e.g. data vendor providing the API, engineers must know who and how to contact.

If these contacts were documented in the Data sources docs ([API](./data-source-api.md), [S(FTP)](./data-source-s-ftp.md)), cross-reference that part here.

## Other items

Anything else that is unique to this particular pipeline but doesn’t fall in the above sections.

## Debugging tips (optional)

This is an optional section to be used for complex pipelines where debugging is not that straightforward.

For example a useful tip is to set up an API client like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) – This will allow to quickly explore API results without re-running a pipeline.

## Incident Log (optional)

This is an optional section to be used only for the most important pipelines that have severe business impact if things go wrong.

This is also useful if the pipeline is related to vendor data for which a lot of money was paid. If a lot of issues are encountered, keeping a log of them will help get better support, discounts or some other compensation.


| Date of Incident | Summary | Solution | Case Number |
| - | - | - | - |
| | | Can be a temporary one or a long term one. | If there is an external support system where incidents must be raised. | 