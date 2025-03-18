import { Runner } from "@lib"
import cluster from "./cluster-scoped.k8"
import namespaced from "./namespaced.k8"

async function main() {
    const runner = new Runner({
        summarizer: {},
        progress: {
            waitTransition: 1,
            debug: true
        },
        saver: {
            outdir: ".k8ts"
        },
        checkDanglingRefs: true
    })

    await runner.run([cluster, namespaced])
}
main()
