import { Metadata } from "@k8ts/metadata"
import { K8tsWorld, Secret } from "k8ts"

export const W = new K8tsWorld("metadata-basics")

// Creating a Metadata object with different key formats:
// 1. Labels: keys starting with %
// 2. Annotations: keys starting with ^
// 3. Comments: keys starting with #
//
// Comment metadata doesn't appear in the k8s manifests, while labels and annotations do.
// While Kubernetes also treats name and namespace as metadata, k8ts handles them differently
// and they're not handled through the Metadata class.

const metadata = new Metadata({
    "%app": "demo-app",
    "^maintainer": "devops-team",
    "#internal-note": "This comment won't appear in the k8s manifest",
    "^example.com/annotation": "domain-annotation"
})

// Add throws an error if the key already exists
metadata.add("%team", "platform")
// Overwrite doesn't care if the key exists or not
metadata.overwrite("^version", "1.1.0")
// Delete removes a key. It also doesn't care if the key exists or not
metadata.delete("#internal-note")

// The Metadata object lets you define multiple keys under a domain prefix in one go.
// You pass an argument ending with a '/' to indicate a domain prefix and an object.
// K8ts will prefix all keys in the object with that domain.
// The %, ^, and # prefixes are applied to keys in the object, not to the domain itself,
// so you can mix different types of metadata too.
metadata.add("example.com/", {
    "%label1": "grouped-label",
    "^annotation1": "grouped-annotation",
    "#comment1": "grouped-comment"
})

// We can also pass in a single object that can have both domain and regular keys.
// You can pass this kind of object whenever k8ts expects metadata.
metadata.add({
    "example.com/": {
        "%label2": "another-grouped-label",
        "#comment2": "another-grouped-comment"
    },
    "%example.com/single-label": "single-label",
    "^blah": "no-domain-annotation"
})

// Passing a domain to delete removes all keys under that domain of all types.
metadata.delete("example.com/")
// You can also pass a list of specific keys to delete under a domain:
metadata.delete("example.com/", ["%label1", "^annotation1"])

// Metadata is iterable
for (const [key, value] of metadata) {
    // Each entry is a [key, value] pair
}

W.File("secrets.yaml", {
    *resources$(FILE) {
        // Setting metadata via the $metadata property using all three key formats
        const secret = new Secret("example-secret", {
            $data: {
                username: "admin",
                password: "super-secret-password"
            },
            $metadata: {
                "%app": "auth-service",
                "%component": "secrets",
                "^rotation-policy": "90-days",
                "#created-by": "example-script"
            }
        })

        // Metadata keys and values are validated on assignment.
        // You can also change them after creation via the metadata property:
        secret.metadata.add("%owner", "platform-team")
        secret.metadata.overwrite("^rotation-policy", "30-days")
        secret.metadata.delete("#created-by")

        // Domain namespacing works here too:
        secret.metadata.add("k8ts.org/", {
            "%managed-by": "k8ts",
            "^framework-version": "1.0.0"
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
