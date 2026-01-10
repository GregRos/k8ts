Generate examples for the scenarios specified in [f](./example-scenarios.md).

Generate only the following scenarios:

1. Metadata basics

## How to generate examples
Examples should go in subdirectories of `k8ts/packages/examples/src/`. Each scenario should have its own subdirectory named after the scenario, e.g. `basic-usage`, `advanced-metadata`, etc.

Each example should include:

1. One or more TypeScript files that define and generate the resources for that scenario.

## Documentation and examples
See the existing examples in [](../../packages/examples/src/) for reference on how to structure the examples. Existing examples include:

1. [](../../packages/examples/src/basic-deployment/) A simple example demonstrating how to create a Kubernetes Deployment using k8ts.

When generating examples, make sure to research the relevant API features of k8ts to ensure the examples are accurate and showcase the capabilities of the framework effectively.

Use the Laniakea project as a reference for real-world usage of k8ts to define Kubernetes resources for various use-cases. Almost every feature of k8ts is used in Laniakea, so it can serve as a comprehensive guide for creating examples.

Markdown documentation is available in [](../../k8ts.docs/) .Describes the core entities and relations between framework objects, the building blocks that underly resources, etc. Doesn't have much in the way of usage examples.

## Example style
1. Avoid emiting to console unless necessary for demonstrating RUNTIME functionality.
2. Do not repeat the same information.
3. Prefer comments over console.log.
4. Do not use === for sections.
5. Describe what a bit of code is doing using comments.