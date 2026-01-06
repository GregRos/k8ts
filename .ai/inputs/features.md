
# References between resources

```yaml ORIGINS
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
        - Set its $metadata
        - Create a File:
            - Set its $metadata
            - Create some resources
            - Show that metadata from the File and World are both applied to a resource

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
Deployment with resources shorthand:
    - Create a Deployment
    - Attach 1 container:
        - Use common ImageRegistry for the image
        - In one container set resources: # note they're all type-checked
            - Show cpu A -> B syntax
            - Show memory via =B syntax
            - Show custom resource a/b equal to just 1

Setting env vars:
    - Create Deployment (replicas:1)
    - Attach 2 containers:
        - Use common ImageRegistry object for the images
        - Set some env vars by literal
        - Set an env var from a local file

Mounting stuff:
    - Create Deployment
    - Attach 1 container:
        - Create Pvc "example" with "standard" storage class:
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
