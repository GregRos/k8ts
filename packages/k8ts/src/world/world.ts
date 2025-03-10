import { KindMap, RootOrigin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { External } from "../external"
import { File } from "../file"
import type { Base } from "../node"
import type { Namespace } from "../resources"
import { K8tsResources } from "../resources/kind-map"
import { version } from "../version"
export namespace World {
    export interface Props {
        name: string
        meta?: Meta.Input
        kinds?: KindMap
    }

    export class Origin extends RootOrigin {
        constructor(props: Props) {
            super(
                props.name,
                Meta.splat(props.meta, {
                    "^k8ts.org/": {
                        "produced-by": `k8ts@${version}`,
                        world: name
                    }
                }),
                kindMap.merge(K8tsResources)
            )
        }
    }

    export class Builder {
        constructor(readonly origin: Origin) {}

        External<Kind extends string>(kind: Kind, name: string, namespace?: string) {
            return new External(kind, name, namespace)
        }

        File<T extends Base>(props: File.Props<Namespace, T>): File<T>
        File<T extends Base>(props: File.Props<"cluster", T>): File<T>
        File<T extends Base>(props: File.Props<any, T>): File<T> {
            return File.make(props, this.origin)
        }
    }

    export function make(props: Props) {
        return new Builder(new Origin(name, meta, new KindMap()))
    }
}

export class K8tsWorld {
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
