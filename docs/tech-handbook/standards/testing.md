# Testing

## Test coverage

There must be a right balance between engineering best practices and actual delivery. The following achieves the right balance:

- Tests are mandatory for functions in common package/modules, reused by other apps.
- Tests are optional for everything else.

If you have the luxury of time to write tests for everything – start with unit test for individual functions.

The unit test for the whole data pipeline – must be done last. The main purpose of this test would be to test how all functions in the flows interact with each other (borderline integration test). And since some functions may be mocked/monkey patched, it may not catch all failures/breaking changes.

The test coverage ratio of 80% – is an aspirational target, rather than a mandatory one. 

From my personal experience, I saw projects with test coverage as low as 10% working flawlessly without breaking. This was because only the most critical functionality was tested. However, PR reviews were incredibly thorough, catching a lot of errors before they were merged.

## Meaningful tests

Think about what you are testing.

Explicit things **not to do**:
- There is no value in testing a function for huge number of values. For example, asserting 1000s of values from a `for` loop. This will be reported as a 1000 different tests by `pytest`, slowing things down. Few values covering main possibilities (in the function logic) and edge cases is enough.

## Test organisation

Group tests in classes for logical separation.

This applies even in cases when a group has 1 or 2 tests.

This method helps to organise tests – instead of using comments or empty lines to separate groups, Classes with clear naming conventions can be used.

## Integration tests

These are not written often (if at all) in data engineering.

Main reason - majority of data platforms are stable and well known.

When things fail – it is mainly because of business logic, data quality or some obscure infrastructure problem. Integration tests do not catch these failures.

Furthermore, there are regular alerts that cover any issues with data sources (APIs, SFTPs, web scrapers, etc).