k8ts (pronounced “Kate’s”) is a revolutionary TypeScript framework for generating k8s manifests. It’s kind of like [cdk8s](https://cdk8s.io/), and serves the same purpose as Helm and Kustomize.

Before you ask, we don’t know who Kate even is.

⌨️ **No typos ever again!**

- Keeps track of references between resources _as you type_.
- Captures manifest structure using advanced TS features.

🔗 **Keep track of resources**

- Metadata traces resources to:
    - The _code that created them_
    - The _commit_ that code is from.
    - The _package version_ that was used to generate them.
- Also prints detailed reports of everything that got created.

📂 **Build directory trees**

- Rich _file-based model_ lets you pack resources into individual files.
- Organize _files_ into _directory trees_.
- Perfect for deploying using GitOps tools.

🧰 **Common APIs**

- Assembling maintainable command-lines
- Describing environment variables
- Embedding local files into manifests.
- Composing paths

🗃️ **Advanced metadata management**

- Shared, inheritable metadata based on rich object model.

🧩 **Highly extensible**

- Use _decorators_ to capture common functionality between objects.
- Describe connections between resources.
- Feed everything to k8ts to figure out!
