import { ConfigMap, K8tsWorld } from "k8ts"

// The K8tsWorld is the root container for all k8ts objects.
// It doesn't contain resources itself, but it contains other containers that do.
export const W = K8tsWorld("origins-and-scopes")

// Here we create a File inside the World. It represents a Kubernetes YAML file that will be created
// during generation. Creating a File like this attaches it to the World, which modifies it.
W.File("origins-and-scopes.yaml", {
    // To define the contents of the file, we use a generator function we call a scope.
    // These scopes always have named ending in dolalr signs. For example,
    // this scope is called resources$.
    *resources$() {
        // In K8ts, when you create an object with `new`, it's expected to perform side-effects.
        // In this case, creating a ConfigMap or another k8s resource will cause it to attach itself
        // to its parent file.

        // That means that simply constructing the resource will cause it to be manifested.
        // In other words, we don't to keep the result like we would with a normal object.
        // We might still do that, but we don't have to in order to cause the resource to be generated.
        new ConfigMap("example-config", {
            $data: {
                key1: "value1",
                key2: "value2"
            }
        })

        // Creating another ConfigMap within the same scope will also attach it to the File.
        new ConfigMap("another-config", {
            $data: {
                message: "Hello from k8ts!"
            }
        })

        // To summarize:
        // - The K8tsWorld is the root container that holds everything
        // - Files are created inside the World and represent YAML output files
        // - The resources$ scope defines what resources belong in the File
        // - Any resources created within this scope will be included in the generated YAML
    }
})

// This is a bit of code that runs the k8ts generator. In a real project, this would typically
// be in a separate file, but for simplicity, we're including it here.
import { Runner } from "k8ts"
;(async function run() {
    await new Runner({
        cwd: `${__dirname}/../..`,
        outdir: `${__dirname}/.k8s`
    }).run(W)
})()
