---
sidebar_position: 1
---

# Python

## uv

Install [uv](https://docs.astral.sh/uv/) to manage both different Python versions and virtual environments for various projects. 

### Package changes

1. Change the package in `pyproject.toml`.
2. Run `uv sync`.
   1. This command will update the `.lock` with the new dependencies but will also update all dependencies to the latest compatible versions
   2. This command will also install the dependencies to your local environment.

:::info
If you are pulling changes from `main` that contain changes to `.lock` file, simply run `uv sync`.
:::

### Direct dependencies

Although not explicitly mentioned in any [official docs](https://packaging.python.org/en/latest/specifications/pyproject-toml/#dependencies) - all examples suggest that only direct dependencies be specified in `pyproject.toml`.

And let your tool (uv or poetry) handle any indirect ones in the `.lock` file.

## uv alternative

As of September 2026, uv is still not in v1. My personal experience with the tool was great, no issues whatsoever.

If you are paranoid about using only stable tools, the alternative is to use [pyenv](https://github.com/pyenv/pyenv) for Python versions and [poetry](https://python-poetry.org/docs/) for the virtual environment.

### Pyenv

Install [pyenv](https://github.com/pyenv/pyenv) to manage different versions of Python.

:::info
pyenv doesn't work natively on Windows. But there is a ported version for Windows which can be used – [pyenv-win](https://github.com/pyenv-win/pyenv-win).
:::

Once pyenv is installed:

1. `pyenv install <version>` to install the necessary version of Python. The latest version will be specified in `pyproject.toml`.
2. `pyenv local <version>` to set the python version for this repository. N.B. Make sure to `cd` to the repository before executing this command.
3. `python --version` to validate which python is being used.

### Poetry

Install [poetry](https://python-poetry.org/docs/) to manage different virtual environments.

The following will automatically create a poetry virtual environment for you:

1. `pip install poetry`
2. `poetry install` 

## .lock file

Both [uv](https://docs.astral.sh/uv/concepts/projects/layout/#the-lockfile) and [poetry](https://python-poetry.org/docs/basic-usage/#committing-your-poetrylock-file-to-version-control), strongly suggest to version control the `.lock` file to ensure that all developers use the same packages in their local development. This `.lock` file must also be used during image build.

## prek and pre-commit

[prek](https://github.com/j178/prek) is a drop-in replacement for [pre-commit](https://github.com/pre-commit/pre-commit). Just like uv, as of September 2026, prek is still not in v1. And just like with uv, my personal experience with the tool was great, no issues whatsoever.

The first `prek install/pre-commit install` may take some time.

## Testing

Use [pytest](https://docs.pytest.org/en/stable/) framework. And [pytest-cov](https://pytest-cov.readthedocs.io/en/latest/readme.html) to output test coverage.

Main reason for choice of `pytest` is because of its readability and ease of use.

Avoid using Python's in-built [unittest](https://docs.python.org/3/library/unittest.html) framework as much as possible, `pytest` will have everything that is needed.

In exceptional cases where using `unittest` is significantly more straightforward than `pytest`, `unittest` can be used. An example is mocking an API response, where `unittest` allows doing it inside the function with a few lines, and `pytest` needs a MockResponse class definition.

## Logging

In majority of cases log **after** the action succeeds. That makes the log an accurate statement of what happened, rather than what was merely attempted.

```python
result = process_file(path)
logger.info("Processed file %s", path)
```

Log **before** + **after** when running diagnostics on actions that are long-running, important, or likely to hang:

```python
logger.info("Processing file %s", path)
result = process_file(path)
logger.info("Processed file %s", path)
```

Log failures explicitly by letting the exception handler capture the traceback:

```python
logger.info("Processing file %s", path)

try:
    result = process_file(path)
except Exception:
    logger.exception("Failed to process file %s", path)
    raise

logger.info("Processed file %s", path)
```

A useful semantic convention is:

- Before: "Starting/attempting..."
- After: "Completed/created/processed..."
- Failure: "Failed...", including the exception

## Package development

Follow the [best practice](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/#dependencies-optional-dependencies) set by PyPA.

The easiest way to get started with python packages (without publishing to [PyPI](https://pypi.org/)) is by using [git tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging), and allowing users with access to a private GitHub repo to install the package directly from the repo.

Sadly, as of September 2026, GitHub still [does not support](https://github.com/orgs/community/discussions/8542) private python packages in a native way.

In larger orgs, you may have a private package management such as [JFrog Artifactory](https://jfrog.com/artifactory/). Which is much easier to use but requires some setup.

Package versions must follow [semantic versioning](https://semver.org/).

### Release process

Bump of the version is required only if there is a functionality change. If only docs are changed, there is no need to bump the version.

The release process looks like this:

1. Implement and test the changes.
   - If [git tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging) are used for versioning, bumping version in `pyproject.toml`, technically doesn’t do anything. But it keeps the `git tag` aligned with `pyproject.toml`, avoiding any confusion.
   - Add the release notes to `releases.md`. Although a release can later be created in the GitHub repo, that release can be accidentally deleted and it is not version controlled.
2. Raise a PR and get it merged.
3. Pull the latest version of the `main` to your local environment.
4. Tag the version and push it to origin. For example, say you are pushing `v1.2.3`

```sh
git tag v1.2.3
git push origin v1.2.3
```

5. Create a [release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) in GitHub for your pushed tag. You can copy the release notes from the `releases.md`.

