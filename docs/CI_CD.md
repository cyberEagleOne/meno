# CI/CD

## Current status

No tracked GitHub Actions workflow was present in the repository at audit start. `.github/workflows/android-ci.yml` has now been added, but has not yet run on GitHub. No deployment host or credentials are configured. Meno has no backend to deploy.

## Proposed workflow

The workflow in `.github/workflows/android-ci.yml` runs on selected branch pushes and pull requests: checkout → Node 22/npm ci → Jest → TypeScript → ESLint → Android JS export → JDK 17/Gradle release APK build → upload APK artifact. Sequential steps ensure test/lint/type failure stops the build and artifact upload. It does not publish a public release.

## Verification boundary

GitHub Actions execution cannot be claimed until a remote push triggers the workflow and a successful run is observed. Android native builds require hosted runner SDK setup and can be slow; the local native build attempt failed before compilation because this host uses Java 8. CI should be validated by its run log after push. No deployment step exists because there is no configured deployment target.
