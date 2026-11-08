# Standards

The purpose of this document is to provide consistency and form shared expectations. This will speed up collaborative work and PR reviews.

## File organisation

The following file structure works well:

- **flow.py** or file ending with **_flow.py**
  - The only file that must contain the actual flow.
  - This file can contain tasks (if there aren’t many of them).
  - This file must not contain any other util functions/configs.
- **tasks.py**
  - This file should only be used if there are many tasks and it is not practical to keep them in flow.py.
  - Be mindful of using many tasks because of their impact on API rate limits.
- **utils.py**
  - Any function that is used in a flow/tasks must be in this file.
- **configs.py**
  - A file containing any configs e.g. list of ids to process.
  - These configs are usually passed to deployment or to a flow (as a default parameter).
  - Usually the format of a config is a dictionary (including complex nested dictionaries).

## Directory organisation

The directory organisation which seemed natural is for all flow code to be stored in the top level `flows/` directory.

The subdirectories then reflect the domains/teams within the business – operations, finance, sales, etc.

Within these subdirectories, you may find the need for further subdirectories reflecting a further sub-area/project.

Another interesting setup is to use directories/sub-directories to contain flows that map to databases in the data warehouse.

### Common package

It is useful to have a `common` package, as a separate top level `common/` directory. 

As the name suggest, this directory should contain `common` functionality which can be re-used across multiple flows.

Before creating new functionality, check if it already exists within the `common` package.

## Blocks

[Prefect Blocks](https://docs.prefect.io/v3/concepts/blocks) can be used store various secrets e.g. API keys, S(FTP) credentials, private keys, etc.

These blocks can be created via the UI. But once the value for a secret type block is set, it can’t be viewed through the UI but can be retrieved using [Prefect Cloud API](./prefect-cloud.md#getting-secret-values). Other block types don’t have this behaviour.

In theory, these blocks can be created via [terraform](https://registry.terraform.io/providers/PrefectHQ/prefect/latest/docs/resources/block) but this would add another layer of abstraction, since terraform would need to pull the value of the secret from another source e.g. GitHub secrets.

## Automations

[Prefect Automations](https://docs.prefect.io/v3/concepts/automations) can be used to generate alerts in case of flow failures.

These alerts can be created using Prefect Cloud UI. This works fine for a few automations.

As the number of automations keeps growing they are best to be [created](https://docs.prefect.io/v3/how-to-guides/automations/creating-automations#single-automation-example) from a separate yaml file using prefect CLI.

There is an option to create these with [terraform](https://registry.terraform.io/providers/PrefectHQ/prefect/latest/docs/resources/automation) but that would mean using another tool.

## Tasks 

Tasks contribute to Prefect [API rate limit](https://docs.prefect.io/v3/concepts/rate-limits). Spamming them will cause problems for the Prefect server.

Use tasks when there is a need for them. A few potential needs:

- In-built retry logic.
- Caching. N.B. in reality this feature is almost never used.
- Timeouts i.e. limits on the duration of task execution.
- Code profiling – Tasks provide a nice piece of metadata in a visual way (in Prefect UI) i.e. how much time each task takes and where is the bottleneck.

## Logging

For consistency, avoid print statements (with a `log_prints=True` option).

Use a proper logger.

## Classes

Data pipelines don't strictly require OOP. 

Prefect, naturally encourage functional style, since flows are structured as a series of functions. 

There must be a good reason to use Classes (including data classes). Don’t use it just because you can or want to practice OOP.

One of the valid use cases is test grouping.

## Helper scripts

There might be a need for some helper scripts, which are executed during CI/CD step but can also be ran locally (for testing purposes).

One script I found useful is related to deployment of only [changed flows](./setup-decisions.md#deploying-only-changed-flows). The logic of this script can be summarised as:

- Takes a list of changed flows (flow.py files).
- Finds the corresponding deployments in the `prefect.yaml` file
- Constructs the `prefect deploy` command with these deployments.

## Testing 

Pytest [supports](https://docs.pytest.org/en/stable/explanation/goodpractices.html#choosing-a-test-layout) 2 modes of organising tests files.
1. Tests outside application code.
2. Tests as part of application code.

The [directory organisation](#directory-organisation) naturally fits with option 2.

Each flow can be thought as it's own small application/service. Therefore, it should have it's own tests.

These tests can exist in a `/test/` sub-directory, e.g. `flows/team_a/project_b/test/`

Within that directory, test file(s) will test the functionality of the code in the parent folder.

This is preferable to all tests living in a single directory because:
1. It makes pairing tests and the code they test far easier as they live in the same place.
2. It makes sure tests and code don’t feel separate – tests must not be an afterthought.

### Test naming

The files containing tests must have unique names. This is due to how Pytest handles filepaths in its default setting. Patching with `importlib` allows non-unique test file names, but this doesn’t allow for easy importing between test files. This means that having common test code, e.g. reusable fixtures, would become far more difficult. As such, the decision was made to stick with Pytest’s default sys.path prepending mode, which requires us to use unique test file names.

Unique test file names should not be difficult to work with given the [directory organisation](#directory-organisation) is base of teams/domains and projects. You can use this to give your test files unique names, e.g. `test_project_a_utils.py` and `test_project_b_utils.py`.

This avoids conflicts during test running which would arise from calling both of those example files `test_utils.py`.

### Prefect test harness  

Prefect provides [prefect_test_harness](https://docs.prefect.io/v3/how-to-guides/workflows/test-workflows) for testing, which spins up a local SQLite database. If used incorrectly, this can add a lot of time to testing pipelines e.g. in some cases it increased the testing pipeline from 1 min to 5 mins.

Use this functionality if you can’t mock the feature. Even then ensure that you are not wasting the resources e.g. by using the harness in a fixture that gets spun up and torn down with each test.

## Parameters

Prefect 3 introduced parameter validation based on type hints.

Practically this means that if type hints are not matching the type of the default value, you will get a `ParameterTypeError`.

However, this error won’t be raised if you explicitly pass a parameter during local testing. If your scheduled deployment is using the default value, you might get the `ParameterTypeError` in Prefect Cloud if it doesn't match the type hints.

`ParameterTypeError` most often gets thrown when `None` is set as a default value for a parameter but not mentioned in the type hints.

The below will throw ParameterTypeError in Prefect Cloud.

```python
@flow(name="foo")
def foo(param: str = None):
```

To avoid the error, adjust the type hint:

```python
@flow(name="foo")
def foo(param: str | None = None):
```

### Static parameter requirement

Parameters in flows must be static (or just variables).

This works:

```python
my_dict = {"foo": "bar"}

@flow(name="foo")
def foo(param: dict = my_dict):
```

This doesn't:

```python
my_dict = {"foo": "bar"}

@flow(name="foo")
def foo(param: dict = my_dict.keys()):
```

The error message for the second case would be very cryptic:

`/bin/sh: 1: Syntax error: "(" unexpected`

This error happens because `my_dict.keys()` can't be serialised i.e. turned into a common format.

In case of Prefect, the common format is yaml. Serialisation is done by `prefect deploy` and default parameters are inserted into the `prefect.yaml` file.

`my_dict.keys()` requires runtime evaluation, hence the error.