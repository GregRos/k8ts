import { BaseOriginEntity, KindMap, LiveRefable, Origin, type Kind } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { assign } from "lodash"
import { External } from "../external"
import { File } from "../file"
import { FileExports } from "../file/exports"
import { FileOrigin } from "../file/origin"
import { K8tsKinds } from "../k8ts-sys-kind"
import { K8tsRootOrigin } from "../kind-map"
export type ManifestFileName = `${string}.yaml`
export namespace World {
    export interface Props {
        name: string
        meta?: Meta.Input
        kinds?: KindMap
    }

    export type DefineScopedFile<Scope extends FileOrigin.Scope> = {
        metadata(input: Meta.Input): DefineScopedFile<Scope>
        Resources<const Produced extends LiveRefable>(
            producer: FileExports.Producer<Scope, Produced>
        ): File<Produced>
    }
    export class Builder extends BaseOriginEntity<Props> {
        readonly kind = K8tsKinds.build_.current_.World
        private readonly _ExternalOrigin: ExternalOriginEntity
        constructor(props: Props) {
            super("World", props, K8tsRootOrigin.node)
            this._ExternalOrigin = new ExternalOriginEntity(this.node)
        }

        External<K extends Kind>(kind: K, name: string, namespace?: string) {
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
                        Resources<const Produced extends LiveRefable>(
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

        private _File<T extends LiveRefable>(
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
export class ExternalOriginEntity extends BaseOriginEntity {
    kind = K8tsKinds.build_.current_.External
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
