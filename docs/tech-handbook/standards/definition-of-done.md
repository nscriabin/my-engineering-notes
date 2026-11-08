# Definition of Done

This document outlines the Definition of Done for the Data Engineering team.

Its main purpose is to provide consistency and form shared expectations.

One of the most useful principles, I have learned in my career is to optimise for delivery, whilst maintaining a high standard of quality. 

This can sometimes feel contradicting and sometimes will require making a compromise.

However, this doc contains a lot of guidance on how to maintain a high standard of quality and improve collaboration at a relatively low cost/effort.

## Data Pipelines

After delivering hundreds of different data pipelines, it becomes clear what works best for which use case (in the context of a specific Data Platform).

Therefore, pipelines must be designed in accordance with [data pipeline design guidelines](./data-pipelines.md).

## Code

Aim to write clean code.

The idea was introduced in a [book](https://amzn.eu/d/0d4kuvDl) by Robert C. Martin. There are many summaries in the web that will introduce you to the idea. 

A few specific things to emphasise (some in addition to clean code):

- **Pure functions** – Data pipelines don't strictly require OOP. Some tools e.g. Prefect, naturally encourage functional style, since flows are structured as a series of functions. Excluding the logging functionality, functions must be pure – this will avoid side effects and simplify testing.
- **Self documenting code** – You must be able to read a code block and work out what it is doing just by looking at function/variable names. Docstrings are required only in exceptional cases that require some context or deal with an edge case.
- **DRY principle** – If you are introducing new functionality – double check if it should live in the common package, allowing it to be re-used by other pipelines.
- **Style guide** – All repos must have a code formatter/linter running in a CI/CD pipeline which will fail the build and prevent the merge.

Make sure that code has been tested in accordance with [testing best practices](./testing.md).

## Docs

Complicated pipelines/services must have their own architecture diagram and decision log.

For self contained projects/service further docs might be required for setup, troubleshooting, etc. “Explicit is better than implicit” – [Zen of Python](https://peps.python.org/pep-0020/), also applies to docs.

Diagrams must be produced with [draw.io](https://app.diagrams.net/), exported as both code and png and saved to the repo. Exporting a diagram as code, allows easy edits to the diagram.

Pipelines dealing with external sources must have the corresponding template ([SFTP/FTP](../templates/data-source-s-ftp.md) or [API](../templates/data-source-api.md)) doc.

All pipelines must have a [runbook](../templates/data-pipeline-runbook.md). 

## Alerts

All pipelines must have alerts configured to streamline the [on-call](../processes/on-call.md#alerts) process.