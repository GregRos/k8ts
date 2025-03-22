import { BaseOriginEntity, KindMap, Origin, type Kind } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { assign } from "lodash"
import { External } from "../external"
import { File } from "../file"
import { FileExports } from "../file/exports"
import { FileOrigin } from "../file/origin"
import { k8tsBuildKind } from "../k8ts-sys-kind"
import { K8tsRootOrigin } from "../kind-map"
import type { ManifestResource } from "../node"
export type ManifestFileName = `${string}.yaml`
export namespace World {
    export interface Props {
        name: string
        meta?: Meta.Input
        kinds?: KindMap
    }

    const ident = k8tsBuildKind.kind("World")
    export type DefineScopedFile<Scope extends FileOrigin.Scope> = {
        metadata(input: Meta.Input): DefineScopedFile<Scope>
        Resources<const Produced extends ManifestResource>(
            producer: FileExports.Producer<Scope, Produced>
        ): File<Produced>
    }
    export class Builder extends BaseOriginEntity<Props> {
        readonly kind = ident
        private readonly _ExternalOrigin: ExternalOriginEntity
        constructor(props: Props) {
            super("World", props, K8tsRootOrigin.node)
            this._ExternalOrigin = new ExternalOriginEntity(this.node)
        }

        External<K extends Kind>(kind: K, name: string, namespace: string) {
            return new External(this._ExternalOrigin.node, kind, name, namespace)
        }

        Scope<const Scope extends FileOrigin.Scope>(scope: Scope) {
            const builder = this
            let meta = Meta.make()
            return {
                File(name: ManifestFileName, props?: FileOrigin.SmallerProps) {
                    props ??= {}

                    const self: DefineScopedFile<Scope> = {
                        metadata(input: Meta.Input) {
                            props = assign({}, props!, {
                                meta: Meta.splat(props?.meta, input)
                            })
                            return self
                        },
                        Resources<const Produced extends ManifestResource>(
                            producer: FileExports.Producer<Scope, Produced>
                        ): File<Produced> {
                            return builder._File(name, {
                                ...props,
                                scope,
                                FILE: producer
                            } as any)
                        }
                    }
                    return self
                }
            }
        }

        private _File<T extends ManifestResource>(
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
const ident = k8tsBuildKind.kind("External")
export class ExternalOriginEntity extends BaseOriginEntity {
    kind = ident
    constructor(parent: Origin) {
        super(
            "EXTERNAL",
            {
                meta: {}
            },
            parent
        )
    }
}
