import { Runner } from "@lib"
import cluster from "./cluster-scoped.k8"
import namespaced from "./namespaced.k8"
Error.stackTraceLimit = Infinity
async function main() {
    const runner = new Runner({
        summarizer: {},
        progress: {
            waitTransition: 1,
            debug: true
        },
        saver: {
            extension: "yaml",
            outdir: ".k8ts"
        },
        checkDanglingRefs: true
    })

    runner.run([cluster, namespaced]).catch(console.error)
}
main()
