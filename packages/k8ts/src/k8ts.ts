import { RootOrigin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { External } from "./external"
import { File, K8tsFile, type K8tsFileProps } from "./file"
import type { Base } from "./node"
import type { Namespace } from "./resources"
import { K8tsResources } from "./resources/kind-map"
import { Cluster, Namespaced } from "./scoped-factory"
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

    File<T extends Base>(props: K8tsFileProps<T, Cluster> & { scope: "cluster" }): K8tsFile<T>
    File<T extends Base>(
        props: K8tsFileProps<T, Namespaced> & { scope: Namespace.Namespace }
    ): K8tsFile<T>
    File(props: K8tsFileProps<any, any> & { scope: "cluster" | Namespace.Namespace }) {
        if (props.scope === "cluster") {
            return this._clusterFile(props)
        } else {
            return this._namespacedFile(props.scope, props)
        }
    }

    private _clusterFile<T extends Base>(props: K8tsFileProps<T, Cluster>): K8tsFile<T> {
        return File(this, {
            ...props,
            FILE: meta => {
                const factory = new Cluster(this, meta)
                return props.FILE(factory)
            }
        })
    }

    private _namespacedFile<T extends Base>(
        ns: Namespace.Namespace,
        props: K8tsFileProps<T, Namespaced>
    ) {
        const nsMeta = this.meta.add({ namespace: ns.name })
        return File(this.child(ns.name, nsMeta), {
            ...props,
            FILE: meta => {
                const factory = new Namespaced(this, meta)
                return props.FILE(factory)
            }
        })
    }
    emit(...files: Iterable<Base>[]) {
        files.forEach(file => {
            console.log("HERE", file)
            for (const node of file) {
                console.log(node.manifest())
            }
        })
    }
}
