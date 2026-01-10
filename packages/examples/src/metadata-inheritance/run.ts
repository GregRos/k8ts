import { ConfigMap, K8tsWorld, Runner, Secret } from "k8ts"

// Different Origins in k8ts (Worlds, Files, etc) can have k8s metadata associated with them.
// They don't use it – they just pass it down to the resources they contain.

// Since a World is the root Origin for all k8ts objects, metadata set on the World
// is inherited by all resources created within that World.
export const W = new K8tsWorld("metadata-inheritance", {
    metadata: {
        "%environment": "production",
        "^overrideMe": "world-level"
    }
})

W.File("secrets.yaml", {
    // File-level metadata is inherited by all resources created within that File.
    metadata: {
        "%component": "auth",
        "^overrideMe": "file-level"
    },
    *resources$(FILE) {
        // You can also set metadata on a resource through its $metadata property during creation.
        const config1 = new ConfigMap("credentials", {
            $metadata: {
                "%app": "web-service"
            }
        })

        // Once created, the resource looks up its inherited metadata and merges it with its own.
        // You can access the final metadata through resource.metadata.
        console.log("ConfigMap metadata:", config1.metadata.record)

        // After the resource is created, you can also modify its metadata directly.
        config1.metadata.add("%owner", "platform-team")

        // All these sources of metadata form an inheritance hierarchy with the lowest level taking precedence:
        // 1. World metadata
        // 2. File metadata
        // 3. Creation $metadata
        // 4. Direct modifications to resource.metadata
        const secret1 = new Secret("api-keys", {
            $metadata: {
                "^overrideMe": "creation"
            }
        })

        secret1.metadata.overwrite("^overrideMe", "modification")
    }
})

async function run() {
    await new Runner({
        cwd: `${__dirname}/../..`,
        outdir: `${__dirname}/.k8s`
    }).run(W)
}

run()
