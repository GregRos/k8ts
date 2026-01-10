import { Cmd, ImageRegistry, Mi } from "@k8ts/instruments"
import { K8tsWorld, Pod } from "k8ts"

// The K8tsWorld is the root container for all k8ts objects.
// It doesn't contain resources itself, but it contains other containers that do.
export const W = new K8tsWorld("basic-structure")

// Here we create a File inside the World. It represents a Kubernetes YAML file that will be created
// during generation. Creatubg a File like this attaches it to the World, which modifies it.
W.File("basic-structure.yaml", {
    // To define the contents of the file, we use a generator function we call a *scope*.
    // This scope is called resources$.
    *resources$() {
        // Scopes let objects know where they belong.
        // Anything constructed inside this scope will belong to the File.

        // For example, when we create a Pod here, it will belong to the File:
        new Pod("xyz", {
            *containers$($pod) {
                // Pod has its own scope, containers$, which lets us create containers and related objects.

                // We'll need to tell the Container which image it should use to run. In Kubernetes, we use a string
                // but in k8ts, we represent the image using an Image object. Let's create one now.

                // We start with ImageRegistry() which creates an object representing a container image registry.
                // From there, we can specify the namespace (optional), repository name, and tag or digest.
                const nginxImage = ImageRegistry().repo("nginx").tag("latest")

                // Let's also tell it which command to run. We do that using a Cmd object. It has a bunch of helpers
                // to make building command lines easier, while type-checking and validating them.
                // Note that the Cmd object specifies both the command and its arguments.
                const command = Cmd("/bin/bash").options({
                    "-c": "echo Hello World"
                })

                // Now we'll create a container:
                $pod.Container("nginx", {
                    // All k8ts properties start with $ to distinguish them from regular manifest properties.
                    // They often mimic the structure of the underlying Kubernetes manifest, but not always.
                    $image: nginxImage,

                    // The $command is similarly an object that represents the command to run.
                    // Using objects instead of strings allows for compile-time validation and code reuse.
                    // This actually translates to both the command and args properties in the manifest.
                    $command: command,

                    // If k8ts doesn't support a specific property yet, or you want to
                    // override something directly, you can use $$manifest. It lets you modify
                    // that part of the manifest that corresponds to this object.
                    $$manifest: {
                        tty: true,
                        securityContext: {
                            privileged: false,
                            runAsUser: 1000
                        }
                    }
                })

                // We're still in the containers$ scope. Another thing we can create here is a Volume.
                // Let's create an emptyDir volume and mount it into another container.
                // Once created, the Volume gets attached to the pod even if we don't use it.
                const emptyDirVolume = $pod.Volume("empty-dir", {
                    // Here, the properties of the k8ts object differ from the manifest.
                    // For Volumes (and some other objects), the $backend property
                    // specifies how something is implemented.
                    $backend: {
                        kind: "EmptyDir",
                        medium: "Memory",
                        sizeLimit: Mi(5)
                    }
                })
                $pod.Container("another-one", {
                    $image: nginxImage,
                    // To mount the volume, we use the $mounts property.
                    $mounts: {
                        // This is an object that maps mount paths to PodVolumes.
                        "/data": emptyDirVolume
                    }
                })

                // To summarize, this Pod will have:
                // 1. A container named "nginx" that runs the nginx image and echoes "Hello World".
                // 2. A second container named "another-one" that also runs the nginx image and has
                //    an in-memory emptyDir volume mounted at /data.
                // 3. An emptyDir volume named "empty-dir" that is mounted into the second container.
            }
        })
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
