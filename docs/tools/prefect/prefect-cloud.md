# Prefect Cloud

## Pricing

When running Prefect Cloud at an [Enterprise scale](https://www.prefect.io/pricing?product=cloud&plan=start), you need to reach out their sales team.

Last time I did it (~September 2025), the rough pricing guidelines were:

Within the enterprise tier, orgs are charged only for 2 things – users and workspaces. The prices are:

- $1,800 per user/year
- $9,000 per workspace/year

There is also a fixed annual (i.e. recurring) enterprise charge between $50k-$70k.

There are no costs associated with extra deployments. Unless, you aim to go back to the Pro tier. Then there will be a hard limit of 1,000 deployments. 

All Prefect commitments are minimum annual commitment.

Reductions to users, workspaces, or other service levels are only permitted at the time of renewal, not mid-term. At renewal, actual usage will be reassessed and service levels (with pricing) can be adjusted accordingly. But those changes will only take effect at the start of the next term.

The limit for automation is 500. Higher-volume of automations (500+) is considered on a case-by-case basis. While the Enterprise tier is designed to support usage well beyond 500 automations, any needs at significantly higher scale may involve a commercial adjustment.

## Dealing with Prefect Cloud

Prefect Cloud used to be much cheaper when it launched. 

I observed a classical SaaS business model. New usage plans introduced with time and these plans had a much higher price.

Between September 2023 and September 2025, there was a 2x price increase for Enterprise tier. New plans had annual commitments and bills (rather than monthly).

But the hard reality is that even with these changes, Prefect Cloud was still cheaper than hiring more devs to self-host Prefect server (and all the associated infra) and migrating to it.

## Getting secret values

Prefect Cloud obfuscates the values of the stored Secret blocks.

Even account admins can’t view the value of secrets.

Knowing the value of secrets is useful for debugging purposes and when you want to replicate the secrets locally for local testing of the pipelines.

Luckily, the value of the secret can be retrieved using Prefect Cloud API ([reading the block document by id endpoint](https://app.prefect.cloud/api/docs?deviceId=1b68a8bf-8978-4f55-a251-88d31f09c8f1&search=block#get-/api/accounts/{account_id}/workspaces/{workspace_id}/block_documents/{id})).

There are several [options](https://docs.prefect.io/v3/api-ref/rest-api#requests-with-prefect) provided for using an API client in the official docs – whether it is `requests`, `curl` or GUI API client like [Insomnia](https://insomnia.rest/).