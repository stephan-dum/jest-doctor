# jest-doctor matrix test suite

this package contains all e2e tests for jest-doctor package.
Instead of unit testing it makes more sense to see how the environment interacts and if certain aspects are meet that could not be tested with unit tests.

## How it works

It launches a jest subprocess inside jest with [runJest](../../matrix/env/runJest.ts) and uses nyc to instrument it.
This approach allows to get coverage for jest internals like jest-doctor environments.

there are also 3 jest sibling folders with different jest versions.
The tests are not directly executed within this package but required from those other packages in order to have different jest versions run the code.
Each for those packages has just one script to launch the tests. The coverage is written into separate folders under .nyc_output to avoid conflicts.
After all tests are run an aggregated coverage report can be created with nyc (package.json script coverage).

as there are many different packages involved the global package.json hosts the test script to make it easier to use.
