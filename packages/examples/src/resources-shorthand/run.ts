import { ImageRegistry, m, Mi } from "@k8ts/instruments"
import { K8tsWorld, Pod, Runner } from "k8ts"

export const W = new K8tsWorld("resources-shorthand")

// In K8ts, you have to specify requests and limits for a resource at the same time.
// This makes the resources section more readable and helps avoid mistakes.
// You can specify request-limits in several ways:
// 1. Using a string-based shorthand
// 2. As an array
// 3. As a {request, limit} object.
// All of these formats need to use the correct units for the resource,
// and all expressions are type-checked
// Note that k8ts does not support specifying CPU in cores (e.g. 1.5), only millicores (e.g. 500m).
W.File("pod.yaml", {
    *resources$(FILE) {
        new Pod("example-pod", {
            *containers$(POD) {
                const nginx = ImageRegistry().repo("nginx").tag("latest")
                POD.Container("app", {
                    $image: nginx,
                    // Let's take a look at the string-based syntax. It's designed to be both concise and readable.
                    // There are several expressions to choose from here.
                    $resources: {
                        // The arrow syntax sets requests and limits to different values:
                        cpu: "100m -> 500m",
                        
                        // You can use a `?` question mark to indicate one of the parts is missing:
                        // cpu: "? -> 500m"
                        // cpu: "500m -> ?"

                        // The equals syntax sets both to the same value. This pattern is common for memory.
                        memory: "=256Mi",

                        // Arbitrary resource names are allowed as long as they have a slash in their names.
                        // They support the same syntax, but the units aren't type-checked.
                        "example.com/custom-resource": "=42",

                        // You can also use "=?" to indicate the resource isn't restricted.
                        // This is the same as not specifying it at all.
                        "k8ts.org/something": "=?"
                    }
                })

                POD.Container("app2", {
                    $image: nginx,
                    // You can also specify request-limits using arrays.
                    // This is analogous to the previous method.
                    $resources: {
                        // You can express them using string literals:
                        cpu: ["150m", "300m"],
                        // You can also use special unit constructors provided by k8ts:
                        memory: [Mi(128), Mi(256)],
                        // If the array has a single element, it's treated as an `=X` style entry.
                        // so it sets both the request and limit to this value.
                        "example.com/gpu": ["1"],
                        // Question marks work here too:
                        "example.com/something-else": ["?", "500m"]
                    }
                })

                POD.Container("app3", {
                    $image: nginx,
                    // Finally, you can specify resources using objects.
                    // This format is clearer but also more verbose. It doesn't support the =X shorthand
                    // since that's not the point.
                    $resources: {
                        cpu: {
                            // You still have to specify both request and limits.
                            request: m(100),
                            // So if you want to leave one empty, you have to use an explicit question mark:
                            limit: "?"
                        }
                    }
                })
            }
        })
    }
})

async function run() {
    await new Runner({
        cwd: `${__dirname}/../..`,
        outdir: `${__dirname}/.k8s`
    }).run(W)
}

run()
