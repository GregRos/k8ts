import { Runner } from "@lib"
import cluster from "./cluster-scoped.k8"
import namespaced from "./namespaced.k8"

async function main() {
    const runner = new Runner({
        summarizer: {},
        progress: {
            waitTransition: 77
        },
        saver: {
            outdir: ".k8ts"
        }
    })

    await runner.run([cluster, namespaced])
}
main()
