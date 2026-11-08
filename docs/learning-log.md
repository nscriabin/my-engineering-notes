---
slug: /learning-log
---

# Learning Log

## 2026

### October

I have finally found time to read [Practical Guide to Airflow 3](https://www.astronomer.io/ebooks/practical-guide-to-apache-airflow-3/) and explored the [companion repo](https://github.com/astronomer/practical-guide-to-apache-airflow-3).

It reminded me of [Data Pipelines Pocket Reference](https://www.oreilly.com/library/view/data-pipelines-pocket/9781492087823/) book - simple examples to get started with Airflow. There are a few chapters and sections that are related only to [Astro](https://www.astronomer.io/), this shouldn't come as a surprise - they are sponsoring the book.

In terms of things I learned from this guide - just one, how [XComs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/xcoms.html) work. Majority of the pipelines I have built and observed in the industry never used XComs and I would always skip this concept in official Airflow docs.

Other than that, since I have been using Airflow for a while at various places, everything else was already known, which was a nice confidence boost.

I also enjoyed the overall architecture of the pipeline that was built throughout the guide.

I got curious if any other vendors in the data space released similar guides/books. And I was shocked to discover that Databricks has [~150 ebooks](https://www.databricks.com/resources?_sft_resource_type=ebooks) - something clearly went wrong somewhere, since data space is not rocket science to require 150 ebooks (from a single vendor).

Finally, I researched and learned a lot about various [open source data warehouse technologies](./tools/research/open-source-data-warehouses.md).