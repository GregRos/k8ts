
```yaml ORIGINS
Origin structure:
    - Create a World using new:
        # this is the root of all generated files and resources
        # it's a mutable container for files that also helps manage metadata.
        # note that it's created using `new` which means it's a stateful, mutalable object in k8ts.
        - Create a File:
            # Doing this mutates the World object by attaching the file to it. 
            # Note that the method starts with a capital letter, whcih also indicates the result
            # is a stateful, mutable object in k8ts.
            in the resources$ scope:
                # This is a scope. Scopes are always generator functions that yield other objects,
                # like K8sResource objects. 
                # They let created objects know where they belong in the resource graph, and change 
                # the inferred type of the container.

Metadata basics:
    - Create a Metadata object:
        - Show the different key formats
        - Show namespacing with `/` keys
        - Demonstrate mutability
        - Iterate over it
        - Note that you seldom need to create these, only modify them
    - Create a Secret and:
        - set its metadata via the `$metadata` property
        - Use all three metadata key formats # note comments are not emitted
        - Show that metadata keys and values are validated on assignment
        - Modify metadata after construction # note that this is supported

Metadata inheritance:
    - Create a World:
        - Set its metadata
        - Create a File:
            - Set its metadata
            - Create a Resource:
                - Set $metadata during creation
                - Modify $metadata after creation
            - Show that metadata from the File and World are both applied to a resource
            - Show how metadata is merged from all levels with the order:
                - Changes to resource.metadata
                - From props.$metadata
                - From file.metadata
                - From world.metadata
        - on("resource/loaded"):
            - Modify resource metadata to override previous settings
        

Events:
    - Create a World:
         - Subscribe to resource/attached:
            - Note when it will fire
            - Modify the resource:
                - Check if it's a ConfigMap called "steve"
                - If so, change its props.$data by adding an extra property
        - Subscribe to resource/loaded:
            - Note when it will fire
            - Modify the resource:
                - Remove the build.k8ts.org/ namespace # note that it's applied at this stage
                - If it's a Pvc named "Bob", set noEmit to true
                - If it's a Pvc with no storageClass, set it to one called "something" (you need to create a DummyResource)
        - Subscribe to resource/manifested:
            - Note when it will fire
            - Note that modifying the resource here does nothing
            - Modify the resource's manifest instead:
                - Add some annotations
        - Subscribe to resource/serialized:
            - Note when it fires
            - Note that modifying the resource or the manifest does nothing
            - Modify the content:
                - Add a line of padding around every YAML --- section
    

```

```yaml RESOURCES
Workloads:
    basic-structure: this is done

    Intermediate scopes:
        Create a World and a File:
            Create a Pod:
                In containers$ scope:
                    Explain: |
                        Although we're inside the Pod's containers$ scope,
                        we're still inside the File's resources$ scope too, so
                        we can still create resources that belong to the File.

                        You can't put k8s resources inside a Pod, so any of those will become
                        attached ot the file instead.

                        We'll usually do this if we need to create resources that are only used by this Pod and nothing else.
                    Create a Pvc:
                        Explain: |
                            A common use-case is creating a Pvc for a workload.
                            It's often only used by that workload and nothing else needs to reference it.
                            So we can just create it here.
                    Create a ConfigMap:
                        Explain: |
                            Another common use-case is creating a ConfigMap for a workload.

                    Create Volumes for Pvc and ConfigMap:
                    Create Container:
                        - Mount Pvc volume
                        - Mount ConfigMap volume
            Create a Section and set some metadata:
                Explain: |
                    Sections are just for grouping resources in the output
                    They're not represented in the k8s manifests. They also let you apply
                    metadata to groups of resources.

                Create a ConfigMap:
                    Explain: |
                        This ConfigMap gets the metadata from the Section (and the File and World too).
                


    Resources shorthand:
        Create a Pod:
            Attach 1 container:
                - Show cpu A -> B syntax
                - Show memory via =B syntax
                - Show custom resource a/b equal to just 1, for use with e.g. GPUs

    Setting env vars directly on container locally:
        Create Pod:
            - Set some env vars by literal
            - Set an env var from a local file # using LocalFile("x.txt").as("text")
            - Set an env var from a local env var # use LocalEnvVar("MY_ENV")
            - Set an env var from a JS object # use LocalObject({ key: "value" }).as("json")

    Setting env vars from resources:
        Create Pod:
            Create a ConfigMap and:
                - Set env via envFrom # note that it's type-checked
            Create Secret and:
                - Set env var via `$env` and specific key   # note the key is type-checked

    Mounting stuff:
        - Create Pod
        - Attach 1 container:
            - Create Pvc "example":
                - Create volume on pod
                - Mount pod on container
            - Create Secret "example-secret":
                - create volume on pod
                - Mount pod on container
            - Create ConfigMap "example-config" with three file keys:
                - Create volume
                - Mount a specific key as a subpath on container # note type checking

    Deployment exposed via Service and HttpRoute:
        - Create Deployment
        - Attach 1 container:
            - Expose 8000 as http
            - Use some example image
        - Create a Service with Deployment as a backend:
            - Map http to 80 # note that it type checks
            - Create HttpRoute with Service as a backend:
                - Use gateway DummyResource, make note that it won't be emitted
                - Expose http port via hostname example.com

    Mutability:
        - Create a Deployment
        - Attach 1 container: ...
        - Set replicas after creation

    Deployment overrides:
        # $override is used to set manifest properties that aren't monitored by k8ts
        # they're not validated and can override stuff that k8ts generates
        - Create Deployment:
            - Set securityContext via $override # make note that it's not validated
            - Attach container with example image:
                - "((meta:use runSubagent(WORKSPACE-READONLY) to find an unmonitored container property))"
                - Set unmonitored container property via $override

    Setting env vars:
        - Create Deployment
        - Attach 1 container:
            - Set an env var from a file
            - Create a ConfigMap and:
                - Set env via envFrom # note that it's type-checked
            - Create Secret and:
                - Set env var via `$env` and specific key   # note the key is type-checked
            - Set from build-time env var



Basic deployments:
    Create deployment and:
        Add some containers with the following:
            - an i
            - env vars
        - Add some containers
        - Show how to access PodTemplate options via $override
        Create a ConfigMap and:
            - create a PodVolume and mount it on a container
            - use it to set an env var via $env # show key is type checked
            - use to set multiple env vars via $envFrom
        Create a Secret and:
            - use it to set an env var via $env

Create deployment and:
    Expose ports 3000, 8000, and 123 (UDP) and:
        create a Service and:
            map: 
                - 8000 to 80
                - 123 to 9001
            create an HttpRoute and:
                bind: 80 to example.com

    

- Create a ConfigMap and mount it as a volume.
- Create a ConfigMap and set it as an env vars via `$env`
- Create
```

1. Create a ConfigMap volume and mount it on a Deployment/Container
2. Create a ConfigMap

# Validation

Navigate your resource graph programmatically.

Resource specs checked both at runtime and compile-time.

Shorthand for defining resource limits/requests, with support for custom resources.

A powerful and concise API

1. Type-checked
1. Lets you create k8s manifests with TypeScript.
1. Provides a summary of all resources produced.
1. Type-checked resource references that let you catch errors.
1. Type-checked string literals (e.g. Service types).
1. Type-checked references between files.
1. Validates manifests while you're writing code and as they're being built.
1. Gives you the freedom to override things at every level.
1. Lets you specify manifests literally or using a range of convenient APIs.
1. Manages metadata and lets you apply it automatically across groups of resources.
1. Object-based API lets you focus on your resources, not formatting text.
