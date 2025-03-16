import { __impl, KindMap, Origin, RefKey, type Kind } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { External } from "../external"
import { File } from "../file"
import { k8tsBuildKind } from "../k8ts-sys-kind"
import type { ManifestResource } from "../node"
import type { Namespace } from "../resources"
export namespace World {
    export interface Props {
        name: string
        meta?: Meta.Input
        kinds?: KindMap
    }

    export class Builder implements __impl {
        readonly kind = k8tsBuildKind.kind("World")
        node: Origin
        get name() {
            return this._props.name
        }
        get meta() {
            return Meta.make(this._props.meta)
        }
        constructor(private readonly _props: Props) {
            const key = RefKey.make(this.kind, _props.name)
            this.node = new Origin(null, this, key)
        }

        External<K extends Kind>(kind: K, name: string, namespace?: string) {
            return new External(this.origin, kind, name, namespace)
        }

        File<T extends ManifestResource>(props: File.Props<Namespace, T>): File<T>
        File<T extends ManifestResource>(props: File.Props<"cluster", T>): File<T>
        File<T extends ManifestResource>(props: File.Props<any, T>): File<T> {
            return File.make(props, this.node)
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
