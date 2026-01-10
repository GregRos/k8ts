
We need to create an examples package called @k8ts/examples. This should be a separate, private package that references all the other k8ts packages.

1. It should have its own yarn.lock (you have to create an empty one)

# Dir structure

```yaml
examples/*/: Each folder should have a separate example in it. TypeScript sources.
examples/dummy/index.ts: a dummy example that just prints hello world
examples/tsconfig.json: The main tsconfig.json
dist/: Where files are compiled if needed
tools/: Automation scripts in JavaScript
package.json: The package.json file
yarn.lock: Start with empty file
README.md: Example info about the package
LICENSE.md: Take from other packages in the project
```

# Package.json
Use the package.json from the examples workspace (laniakea.services).

1. No resolutions field
1. Dependencies to other packages via file: protocol

# Tsconfig.json
Take from laniakea.services
