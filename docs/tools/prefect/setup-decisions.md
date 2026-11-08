# Setup Decisions

Having managed Prefect for ~2 years. Below are some thoughts/decisions that I encountered.

## Deploying only changed flows

Although the prefect deploy CLI command allows the deployment of [all deployments](https://docs.prefect.io/v3/how-to-guides/deployments/prefect-yaml#work-with-multiple-deployments-with-prefect-yaml) at the same time with the `prefect deploy --all`, this was considered wasteful and unnecessary. For example, it was observed that deploying 1 deployment takes `<3` seconds. From some experimentations, deploying 30 deployments took 40 seconds. As you scale up to hundreds of deployments this time will add up.

It is more prudent to deploy only the deployments for which the corresponding `.py` file has changed. There is a [GHA](https://github.com/marketplace/actions/changed-files) which does this.

## Yaml based deployments

Later versions of Prefect allowed to [define deployments with YAML](https://docs.prefect.io/v3/how-to-guides/deployments/prefect-yaml) in a `prefect.yaml` file.

The original method was to use the traditional [.deploy()](https://docs.prefect.io/v3/how-to-guides/deployments/deploy-via-python) method in Python code and then have these collected and executed with a helper module.

YAML configs are much more favourable for multiple reasons:

- Configs in YAML are cleaner than in Python.
- All deployments are viewable from one file. It is easier to enforce things like tagging, workpool resource assignment, etc.
- Native integration with prefect deploy CLI command. No need to use and maintain any helper modules to collect and execute the `.deploy()` parts.

## Changes to k8s job variables

It is possible to overwrite [k8s configmap](./cloud-setup.md#configmap) values in `prefect.yaml` file.

However, if the setup deploys only [changed flows](#deploying-only-changed-flows), then any changes to k8s job variables in the `prefect.yaml` will only affect new/redeployed deployments.

To apply the k8s job variables change to all deployments, all flows will have to be redeployed by making a change in all flow.py files.

N.B. this kind of changes are extremely rare.

## Coupling of flows with the image

There are 2 ways to link the flow's code (.py files) with the Docker image.

1. **Loose coupling with infra** - Store the .py files containing the flow code in [blob storage](https://docs.prefect.io/v3/how-to-guides/deployments/store-flow-code#blob-storage) e.g. S3 bucket. These flows would then be pulled to the Docker image at runtime. 
2. **Tight coupling with infra** - Include the .py files containing the flow code in the Docker image. 

For 1. the best option is to use [IAM Role assumption](https://docs.prefect.io/integrations/prefect-aws/index#iam-role-assumption). This is because AWS Access and Secret Access keys, are not the best from security best practices point of view. 

Option 2. may never sound like a good idea because of tight coupling. But...
It is often a straightforward approach. It avoids having a S3 bucket, AWS credential block, additional steps in `prefect.yaml`. I observed this setup running for years and generally it doesn't cause any problems. But the CI/CD builds take longer because the image has to be rebuilt every time, even with caching it takes time.

## Tagging strategy

Depending on what [coupling](#coupling-of-flows-with-the-image) you choose with the image, you will need to select an appropriate tagging strategy for your Docker images.

If you are using loose coupling for the flows with infra, you can tag the image with a [semver tag](https://semver.org/), which you then specify in the `prefect.yaml`. However, if you [deploy only changed flows](#deploying-only-changed-flows), the new tag will only apply to newly deployed flows. You will need to either redeploy all the deployments or utilise Prefect's [Kubernetes Job Block](https://docs.prefect.io/v3/concepts/blocks) where you can specify the tag for all deployments to use.

If you are using tight coupling for the flows with infra, you will need to tag Docker images with the same tag e.g. `latest`. In this case, deployments will always look for the `latest` tag, which contains the latest changes. 

The default behaviour of ECR repos, is to automatically untag the older image when it's tag is re-used. Which is why this setup works. 

The `latest` setup works well even if you [deploy only changed flows](#deploying-only-changed-flows) or not. 

However, the potential risk of the `latest` approach is that if a PR that breaks all flows gets merged (e.g. python package dependencies update gone bad). Then all flows will automatically use this image and start failing. The flows will continue failing until the breaking PR is reverted/fixed.

This shouldn't happen often (if at all), however, it is important to be aware of this risk.

## Dev environment setup

They say there is no perfect dev environment anywhere...

Personally, I am very curious what works best but I observed the below working well:

- Both dev and prod deployments are kept in a single `prefect.yaml` file. 
- Pushing the image to 2 ECR repos (in dev and prod accounts) with the same tag but building it once.
  - There weren't really good alternatives to this e.g. pointing the workpool in k8s dev cluster to pull the prod ECR image would require a lot of hacking with VPC endpoints.
  - Additionally by having the dev ECR repo it is possible to test things there e.g. tagging strategy, ECR repo settings, etc.
- Keeping both dev and prod deployments in 1 Prefect cloud workspace.
  - There isn't an explicit benefit of having separate dev/prod workspaces in Prefect Cloud.
- General workflow stays the same:
  - Images (both dev and prod) will be built and pushed on merge.
  - Deployments (both dev and prod) will be deployed on merge as well, if the corresponding flow file(s) had changes.
  - The value of branch deploys (to dev) wasn't really obvious.

Dev env are useful for testing in 2 cases:

1. When you can't test things locally
   1. Some APIs/SFTPs require IP whitelisting. 
   2. You require a lot of CPU and RAM which is available in k8s cluster but not on your local machine. 
2. You want to tweak the k8s settings
   1. Doing it in dev first before applying them in prod is a safe way of testing.

## Secret mounting

Initially, I thought that mounting secrets from a Secret Store e.g. AWS Secrets managers to pods using [k8s secrets](https://kubernetes.io/docs/concepts/configuration/secret/) is the way to go.

Then I realised 2 things:

1. These secrets to every single pod, regardless if it is using the secret or not. Not really best practice from security point of view.
2. There is much simpler way to achieve the same thing. Using the inbuilt [Secret](https://docs.prefect.io/v3/concepts/blocks) block in Prefect. It can even store the contents of the file. Store it in one place, no need to mount it anywhere. The flows that need the secret will pull it when needed. 