import { Runner } from "@lib"
import cluster from "./cluster-scoped.k8"
import namespaced from "./namespaced.k8"
import namespaced2 from "./namespaced.k9"
async function main() {
    const runner = new Runner({
        cwd: ".",
        outdir: ".k8ts",
        meta: {
            "^my-custom-annotation": "my-custom-value"
        },
        progress: {
            waitTransition: 5
        }
    })

    await runner.run([cluster, namespaced, namespaced2])
}
main()
