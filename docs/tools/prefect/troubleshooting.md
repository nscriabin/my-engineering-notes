# Troubleshooting

## Blank screen

If after running `prefect server start`, you see a blank page when you go `http://127.0.0.1:4200/`, most likely this is because your `PREFECT_API_URL` wasn't set.

Run

```
prefect config set PREFECT_API_URL=http://127.0.0.1:4200/api
```

And restart all your terminal. If you are using a terminal from your IDE, restart your IDE.

## Flow runs not displaying in local server page

If the flow don't get displayed on your local server's Dashboard/Run page, restart your local server.

## DistutilsPlatformError

If you are on Windows and during setup, you encounter an error, mentioning that:

```
distutils.errors.DistutilsPlatformError: Microsoft Visual C++ 14.0 or greater required.
```

[Install C++ Build tools](https://stackoverflow.com/a/54136652). Ensure that the correct OS for the Windows SDK is selected i.e. if you are on Windows 10, select Windows 10 SDK.

## VS Code/Pylance not recognising import paths

This usually happens when you import a `.py` file from the same (sub)directory without the `.` (to reference the current directory).

VSCode (and perhaps other IDEs) does not recognise the imported functions. This prevents useful features like syntax highlighting and using shortcuts such as `Go to Definition`.

The [suggested fix](https://code.visualstudio.com/docs/python/editing#_importresolvefailure) from VSCode do not work.

The code will still work when executed because Python adds the directory of the file to [sys.path](https://docs.python.org/3/library/sys_path_init.html) automatically but pylance has no such behaviour.

So instead of:

```python
from file_a import ...
```

Use the full import path (relative to flows/ directory):

```python
from dir1.sub_dir2.file_a import ...
```

:::info
Avoid using relative imports e.g. from .file_a import. Stick with absolute imports for consistency.
:::

## CI/CD pipeline and secrets

CI/CD pipeline might attempt to read Prefect secret value during deployment.

This will cause a failure.

This can happen when secret values are accessed incorrectly from a simple class attribute and not from the __init__ method.

This below will cause an error during the CI/CD step.

```python
from prefect.blocks.system import Secret

class Secrets:
    username: str = Secret.load("username").get()
    password: str = Secret.load("password").get()
```

This happens because of the Python mechanics.

In Python:

Class attributes are evaluated at import time i.e. when the module is loaded.

During [prefect deploy](https://docs.prefect.io/v3/how-to-guides/deployments/prefect-yaml#work-with-multiple-deployments-with-prefect-yaml) – a class is loaded from the module, hence the attributes get evaluated. But since this code is run in a CI/CD pipeline there is no communication with Prefect Cloud – hence the failure.

The correct way to use Classes to organise secrets (if you are a fan of OOP) is to load these secrets in the __init__ method. 

Alternatively, simply load these in a function.