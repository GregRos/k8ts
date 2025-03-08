import { RootOrigin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { External } from "./external"
import { File } from "./file"
import type { Base } from "./node"
import type { Namespace } from "./resources"
import { K8tsResources } from "./resources/kind-map"
export class K8tsWorld extends RootOrigin {
    constructor(extra?: Meta.InputMeta) {
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

    File<T extends Base>(props: File.Props.Cluster<T>): File<T>
    File<T extends Base>(props: File.Props.Namespaced<T>): File<T>
    File(props: File.Props<any, any> & { scope: "cluster" | Namespace }) {
        if (props.scope === "cluster") {
            return this._clusterFile(props as any)
        } else {
            return this._namespacedFile(props.scope, props as any)
        }
    }

    private _clusterFile<T extends Base>(props: File.Props.Cluster<T>): File<T> {
        return File.make(this, {
            ...props,
            FILE: meta => {
                const factory = new File.Factory.Cluster(this, meta)
                return props.FILE(factory)
            }
        })
    }

    private _namespacedFile<T extends Base>(
        ns: Namespace.Namespace,
        props: File.Props.Namespaced<T>
    ) {
        const nsMeta = this.meta.add({ namespace: ns.name })
        return File.make(this.child(ns.name, nsMeta), {
            ...props,
            FILE: meta => {
                const factory = new File.Factory.Namespaced(this, meta)
                return props.FILE(factory)
            }
        })
    }
    emit(...files: Iterable<Base>[]) {
        files.forEach(file => {
            console.log("HERE", file)
            const iterator = file[Symbol.iterator]
            for (const node of file) {
                console.log(node.manifest())
            }
        })
    }
}
