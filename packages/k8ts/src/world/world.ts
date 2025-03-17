import { BaseOriginEntity, KindMap, type Kind } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { External } from "../external"
import { File } from "../file"
import { k8tsBuildKind } from "../k8ts-sys-kind"
import { K8tsRootOrigin, kinded } from "../kind-map"
import type { ManifestResource } from "../node"
import type { Namespace } from "../resources"
export type ManifestFileName = `${string}.yaml`
export namespace World {
    export interface Props {
        name: string
        meta?: Meta.Input
        kinds?: KindMap
    }

    const ident = k8tsBuildKind.kind("World")
    @kinded(ident)
    export class Builder extends BaseOriginEntity<Props> {
        readonly kind = ident

        constructor(props: Props) {
            super("World", props, K8tsRootOrigin.node)
        }

        External<K extends Kind>(kind: K, name: string, namespace?: string) {
            return new External(this.node, kind, name, namespace)
        }

        File<T extends ManifestResource>(
            name: ManifestFileName,
            props: File.Props<Namespace, T>
        ): File<T>
        File<T extends ManifestResource>(
            name: ManifestFileName,
            props: File.Props<"cluster", T>
        ): File<T>
        File<T extends ManifestResource>(
            name: ManifestFileName,
            props: File.Props<any, T>
        ): File<T> {
            return File.make(name, props, this.node)
        }
    }

    export function make(props: Props) {
        return new Builder(props)
    }
}
