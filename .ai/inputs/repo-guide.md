# Repository Guide

This is a monorepo containing the k8ts project and sattelite packages. K8ts is a project for generating k8s manifests using TypeScript. The flagship package is `k8ts` at #file:k8ts/package.json.

Create a guide for this monorepo, looking at it at the REPOSITORY level. Such a guide should contain the following:

0. Explain the purpose of the flagship package.
1. Module system(s) used.
2. List of packages and their purposes.
3. Package.json configuration and dependency structure (mermaid diagram)
4. tsconfig.json dependency structure (mermaid diagram)
5. How code is compiled and where it goes. Note that tsx is not used, we compile code.
6. vscode workspace configuration
7. vscode tasks and launch configuration.
8. package.json scripts for managing the repository.
9. Linting software and configuration.

Ignore the following due to impending changes:

1. CI structure
