We'll use this project to extract a template for a monorepo.

To that end, create the folder `_ai/template` where we'll create a streamlined representation of the directory and config structure.

Focus on #packages/metadata and #packages/instruments. IGNORE #packages/k8ts as it has specialized aspects that are not suitable for templating.
## 1. Key components of each package
Each project has the following key files and folders:

1. .vscode: vscode settings, tasks, launch configuration
2. test: tests
3. src: project code
4. tools: build, deployment, other scripts
5. LICENSE.md and contents
6. README.md but remove contents, replace with generic
7. jest.config.mjs
8. package.json: scripts
9. github actions pipelines 

Research the following to make sure you understand:

1. Tsconfig.json reference, extends, and build structure.
2. Package.json structure
3. Which kinds of dependencies go into each package file
4. The src/test folders
5. Vscode configuration
6. Linting configuration
7. How test configuration is inherited
8. Yarn configuration (.yarnrc.yml)
9. Core markdown files
10. Git configuration
## 2. Key aspects to preserve
In the template, make sure to preserve the following aspects:

1. Each project can run its own testing and compilation without dependencies from the root.
2. Linting is only done from the project root.
3. Capture the tsconfig.json inheritance via `tsconfig.base.json`
4. Capture jest config inheritance
## Strip
The following aspects should not be part of the template:

1. Ignore build artifiacts, e.g. `dist` etc
2. Remove all information that pertains to the specific nature of each package, including:
	1. Package names in folder structure and config files. Replace with tokens, e.g. `package-a` and `package-b`.
	2. Specific environment variables
	3. Any "examples" folders or reference to them
	4. Readme contents, replace with generic 
3. ALL runtime dependencies, e.g. `lodash`, `parjs`, `immutablejs`, etc.
4. Package keywords

