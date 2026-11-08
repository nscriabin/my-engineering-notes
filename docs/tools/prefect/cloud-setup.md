# Cloud Setup

In my career I've managed a Prefect based data platform on AWS and K8s, which spun up ~15k pods across all namespaces and clusters every day.

This doc focuses on high level details of how to setup Prefect with Prefect Cloud, AWS and K8s.

It is assumed that readers are familiar with the basics of Prefect, k8s, Docker and general AWS services (IAM, ECR, SecretsManager, etc).

## Architecture

![Prefect Cloud setup](/img/prefect-cloud-setup.png)

## Prefect Cloud

[Prefect Cloud](https://www.prefect.io/prefect/cloud) is a managed version of the open source Prefect [server](https://docs.prefect.io/v3/advanced/self-hosted) plus additional features. At its core, Prefect Cloud provides a scheduler, a queue, a metadata database and a UI.

The actual flows can be run either on custom infra or on Prefect Cloud's infra.

If the flows are run on the custom infra (k8s cluster), Prefect Cloud will never see the actual data, credentials or code.

## Container registry

A Docker image, containing all required packages to run the flow (prefect, pandas, etc.) must be pushed to a container registry e.g. AWS ECR repo.

This is the image that will be ultimately used by the k8s pods executing the flow's code.

Depending on the setup, the image might also include the [flows code](./setup-decisions.md#coupling-of-flows-with-the-image).

The ECR repo would usually be created with terraform.

## K8s

The k8s setup includes:

- Namespace
- Deployment of Prefect Workers
- Secrets
- Service Accounts
- ConfigMap

Make sure to ask for help from your cloud platform team to set these things up.

### Namespace

Prefect must be setup in its own namespace to isolate the resources and allocate the costs.

One important thing to emphasise is the need for hard limit on number of k8s [pods](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-pod-namespace/) in this namespace.

This is required for safety reasons. 

I have observed multiple incidents, where k8s jobs and pods were not terminated and cleaned up correctly. This led to impact on other namespaces because of [Kubernetes API Server](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/) being overwhelmed as it was trying to clean up pods that were not terminating.

### Prefect Workers

[Prefect worker](https://docs.prefect.io/v3/concepts/workers) is responsible for polling and executing scheduled runs.

Prefect worker is a continuous running process in a k8s pod. It can be deployed using the official [prefect helm chart](https://github.com/PrefectHQ/prefect-helm/tree/main/charts/prefect-worker).

For each flow run, prefect workers will create a k8s job, which will in turn create a k8s pod. The k8s pod will pull the image from ECR and execute the flow. This k8s pod will live stream the logs and the run state (aka status of the flow) back to Prefect Cloud.

Once the flow is completed, the k8s job and pod will be automatically terminated.

### Secrets

Sensitive data (passwords, private keys, etc.) can be made available to k8s pods via [secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

There is only 1 secret [required](https://github.com/PrefectHQ/prefect-helm/tree/main/charts/prefect-worker#configuring-a-worker-for-prefect-cloud) - a Prefect API key, which enables authentication with Prefect Cloud. It must be passed to worker configuration in helm release.

This secret can pulled from a Secret store e.g. AWS Secrets Manager. This allows creating/editing Secret’s value in AWS Secrets Manager UI.

### Service Accounts

K8s permissions are controlled with [service account](https://kubernetes.io/docs/concepts/security/service-accounts/). The k8s pods executing the flows will use this service account.

To apply the necessary AWS permissions to a k8s pod, it is necessary to [link](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html) its service account with an IAM role.

This linking can be implemented in terraform. The IAM role that will be ultimately assumed by the k8s pod running the flow’s code can also be defined in terraform.

The IAM role contains write/read permissions to various S3 buckets and their corresponding KMS encryption keys.

### ConfigMap

Ultimate k8s job/pod configuration can be set in a [ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/). This configmap can be [passed](https://github.com/PrefectHQ/prefect-helm/blob/853d082809d4de09b10bcb41af1300e9a4b24fd9/charts/prefect-worker/values.yaml#L142) to worker configuration in a helm release. 

This configmap can set default resource limits (cpu and memory), image to use, image selection policy, etc. 

:::info
The values in configmaps can be overwritten in the [prefect.yaml](https://docs.prefect.io/v3/how-to-guides/deployments/prefect-yaml#work-pool-fields) file.
:::

2 specific variables to emphasise:

- [ttlSecondsAfterFinished](https://kubernetes.io/docs/concepts/workloads/controllers/job/#ttl-mechanism-for-finished-jobs) – deletes the job immediately after finishing.
- [activeDeadlineSeconds](https://kubernetes.io/docs/concepts/workloads/controllers/job/#job-termination-and-cleanup) – deletes the job (whatever its status) after specific time limit.

Both of these variables are useful for staying within the hard limit in terms of number of jobs defined for the [namespace](#namespace). This keeps namespace and the whole k8s cluster healthy, preventing any incidents when jobs/pods get created in a chaotic manner.

### Prefect related k8s costs

As mentioned previously, such setup spun up ~15k pods across all namespaces, clusters every day.

Majority of these pods (~80%+) were tiny – 512MB in RAM and 0.25CPU.

The cost was just ~$6k per year.

The cost was estimated using [opencost](https://opencost.io/) by applying a simple filter on namespaces, where Prefect related pods are running.


## Third Party Sources/Destinations

Data is ingested from third parties sources. These include:
- APIs
- S(FTP) servers
- Data scraped from websites

Sometimes data is loaded to these external destinations e.g. for regulatory reporting.

## Internal Sources/Destinations

Internal sources/destination can include:

- Data warehouse e.g. Snowflake
- Data lake e.g. S3 + Presto
- Data lakehouse e.g. Databricks
- Object storage e.g. S3
- RDBMS e.g Postgres
- Pub/sub systems e.g. Kafka

Prefect can be used to move data between these storage solutions, as well as within them.

Taking data warehouse as an example. A prefect flow might read data from Snowflake table, enrich it with data from API, transform it and write the data back to another Snowflake table.