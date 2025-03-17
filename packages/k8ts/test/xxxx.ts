import { Runner } from "@lib"
import { start } from "pretty-error"
import cluster from "./cluster-scoped.k8"
import namespaced from "./namespaced.k8"
start()

Error.stackTraceLimit = Infinity
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

    runner.run([cluster, namespaced]).catch(console.error)
}
main()
