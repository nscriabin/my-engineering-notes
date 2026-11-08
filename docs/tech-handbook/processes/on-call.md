# On-call

## General structure

From my experience, data engineering teams do on-call only during in office hours.

This is because majority of data pipelines are for analytical and reporting use cases. These are not needed for weekends or out of hours. Any failures during the weekend can be handled on Monday.

There are always an exception when a data pipeline is needed for software engineering systems. But this is more of an exception than a rule.

Team members usually rotate - either daily or weekly. From my personal experience, weekly rotas are gruelling.

## Preparing for on-call shift

You need to be in the correct mindset for your on-call shift. Some key things to note:

1. **General attitude** – It will be stressful and challenging to login for 5 days straight and see several alerts about the pipelines that you might have never encountered. Instead of feeling depressed, try to take it as a learning challenge. This will make a big difference.
2. **Objective reality** – Data engineers are rarely doing business critical things. Breathe out, you are not getting fired if you can’t resolve the alert immediately.
3. **Team is there to help** – if you can’t figure out the issue in 10–15 mins from the runbook or logs, ask the team. You are not there to know everything and solve every issue.

## Alerts

### How to receive alerts

2 options for pipelines to output alerts:
- To an email distribution list
- To Slack/MS Teams channels

Pick one and stick with it. 

The alerts can be first routed to a service like [PagerDuty](https://www.pagerduty.com)/[Incident.io](https://incident.io/).

The actual alerts will be sent from whatever platform you are using e.g. in case of Prefect, [automations](https://docs.prefect.io/v3/concepts/automations) can be used.

Sometimes an alert can be raised directly from the code when a pipeline technically doesn't fail but an alert is still needed.

### SLAs

[SLAs](https://en.wikipedia.org/wiki/Service-level_agreement) in the context of when the data has to be available for users is incredibly useful for on-call engineers.

This helps with collective understanding on when and why data is needed.

These SLAs have implication for how quickly issues have to be fixed and also helps with prioritisation in case of multiple alerts from different pipelines at the same time.

### Alert template 

Alerts templates streamline the on-call experience and minimise investigation times.

An example template is below:

```
Name of the pipeline 

- Link to failed run
- SLA to fix
- Error traceback 
- Link to Runbook
- Stakeholders - Team(s) affected, usually direct users of data
- Pipeline Owner - This is useful in large organisations with decentralised setup, where multiple teams can create pipelines. Some orgs specify a person as an owner. Some specify a team.
```

### Resolving the alert

In the ideal world, the run book would cover the most common issues that can be encountered in the pipeline.

Any issues that you can’t resolve with the run book / anything you’re unsure about, you can pair with the owner to understand how to resolve, including then updating the run book.

Unfortunately, sometimes the owner will not be available for pairing, then you need to do an old-school thing. Dig into the code yourself and understand the issue. It will be unpleasant but it works.

N.B. Often, there are transient issues with APIs/(S)FTPs which are resolved by a simple re-run of the pipeline.

## Monitoring chats

As part of the on-call duties, engineers must monitor chats where users ask questions/raise issues. 

Some orgs have one chat for this purpose. Other orgs have multiple chats e.g. one chat per team.

One chat for everything is more streamlined.

As with the alerts, there is no expectation to solve everything straight away. If you can’t resolve the issue within 10–15 minutes, coordinate within the team re the best course of action.

Unlike with email alerts, the requests from these chats won't have an urgency specified by default or a run book linked.

Firstly, establish the priority when the stakeholders want their requests handled.

A few points about processing the request:

1. If the request is obvious, implement the necessary change and create/update the corresponding docs (if necessary).
2. If the request is not obvious, coordinate with the team on who has the knowledge and capacity to implement the fix.
   1. If nobody has capacity, ask the manager to make a decision on who will be handling the request when.
   2. For non-urgent requests, raising a ticket (with as much information collected from users) into the backlog is a perfectly acceptable option. Share the ticket to the person raising the request for transparency and collaboration.

## Ticket work

Engineers are still expected to work on features during their on-call shift.

Main reasoning for this is that majority of alerts happen in the morning and are usually resolved quickly.

However, it is a good idea to pick up less urgent features during the on-call shift, in case an urgent alert comes through and you need to drop everything.