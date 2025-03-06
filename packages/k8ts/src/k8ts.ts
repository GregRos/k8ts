import { RootOrigin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { External } from "./external"
import { File, type K8tsFile } from "./file"
import type { ClusterScopeFactory } from "./graph"
import type { Base } from "./node"
import { K8tsResources } from "./resources/kind-map"

export class K8ts extends RootOrigin {
    constructor() {
        super(
            "k8ts",
            Meta.make({
                "^k8ts.io/": {
                    "produced-by": "k8ts",
                    version: "0.0.1"
                }
            }),
            K8tsResources
        )
    }

    External<Kind extends string>(kind: Kind, name: string, namespace?: string) {
        return new External(kind, name, namespace)
    }

    File<T extends Base>(
        name: string,
        producer: (factory: ClusterScopeFactory) => Iterable<T>
    ): K8tsFile<T> {
        return File(this, name, producer)
    }

    emit(...files: K8tsFile[]) {
        files.forEach(file => {
            console.log(file.filename)
            for (const node of file) {
                console.log(node.manifest())
            }
        })
    }
}
