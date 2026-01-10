import { ImageRegistry } from "@k8ts/instruments"
import { Deployment, K8tsWorld, Runner } from "k8ts"

console.log("Hello World!")
export const W = new K8tsWorld("dummy")

W.File("dummy.yaml", {
    *File(FILE) {
        yield new Deployment("xyz", {
            $template: {
                *Containers(Pod) {
                    yield Pod.Container("nginx", {
                        $image: ImageRegistry().repo("nginx").tag("latest")
                    })
                }
            }
        })
    }
})
;(async () => {
    await new Runner({
        cwd: `${__dirname}/../..`,
        outdir: `${__dirname}/.k8s`
    }).run(W)
})()
