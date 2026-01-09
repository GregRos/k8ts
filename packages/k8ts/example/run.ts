import { Runner } from "../dist"
import "./cluster-scoped.k8"
import "./namespaced.k8"
import { W } from "./world"

async function main() {
    const runner = new Runner({
        outdir: ".k8ts",
        metadata: {
            "^my-custom-annotation": "my-custom-value"
        }
    })

    await runner.run(W)
}

main()
