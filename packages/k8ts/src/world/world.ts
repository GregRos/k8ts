import { KindMap, RootOrigin, type Kind } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { External } from "../external"
import { File } from "../file"
import type { ManifestResource } from "../node"
import type { Namespace } from "../resources"
import { K8tsResources } from "../resources/kind-map"
export namespace World {
    export interface Props {
        name: string
        meta?: Meta.Input
        kinds?: KindMap
    }

    export class Origin extends RootOrigin {
        kind = "World" as const
        constructor(props: Props) {
            super(props.name, Meta.make(props.meta), K8tsResources.merge(props.kinds))
        }
    }

    export class Builder {
        constructor(readonly origin: Origin) {}

        External<K extends Kind>(kind: K, name: string, namespace?: string) {
            return new External(this.origin, kind, name, namespace)
        }

        File<T extends ManifestResource>(props: File.Props<Namespace, T>): File<T>
        File<T extends ManifestResource>(props: File.Props<"cluster", T>): File<T>
        File<T extends ManifestResource>(props: File.Props<any, T>): File<T> {
            return File.make(props, this.origin)
        }
    }

    export function make(props: Props) {
        return new Builder(new Origin(props))
    }
}

export class K8tsWorld {
    emit(...files: Iterable<ManifestResource>[]) {
        files.forEach(file => {
            console.log("HERE", file)
            const iterator = file[Symbol.iterator]
            for (const node of file) {
                console.log(node.manifestBody())
            }
        })
    }
}
