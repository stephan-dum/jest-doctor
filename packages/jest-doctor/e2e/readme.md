# jest-doctor matrix test suite

This package contains all e2e tests for jest-doctor package.
Instead of unit testing it makes more sense to see how the environment interacts and if certain aspects are meet that could not be tested with unit tests.

## How it works

It launches a jest subprocess inside jest with [runJest](runJest.ts) and uses c8 to instrument it.
This approach allows to get coverage for jest internals like jest-doctor environments.

There are also three matrix/jest<MAJOR_VERSION> folders with different jest versions.
The tests are not directly executed within this package but uses the directory of those matrix packages to have the different jest versions run the code.
Coverage is written into the .c8_output folder. After all tests have run an aggregated coverage report is created and put into .nyc_output.
This can be then merge with unit test coverage by using the `coverage:merge` script.
