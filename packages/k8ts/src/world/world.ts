import { BaseOriginEntity, LiveRefable, Origin, type Kind, type Kinded } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { assign } from "lodash"
import { External } from "../external"
import { File } from "./file"
import { FileExports } from "./file/exports"
import { FileOrigin } from "./file/origin"
import { build } from "./k8ts-sys-kind"
export type ManifestFileName = `${string}.yaml`

export namespace World {
    export interface Props<Kinds extends Kind.Kind> {
        kinds: readonly Kinds[]
        name: string
        meta?: Meta.Input
    }

    export type DefineScopedFile<Kinds extends Kind.Kind, Scope extends FileOrigin.Scope> = {
        metadata(input: Meta.Input): DefineScopedFile<Kinds, Scope>
        Resources<const Produced extends LiveRefable<Kinded<Kinds>>>(
            producer: FileExports.Producer<Scope, Produced>
        ): File<Produced>
    }
    export class Builder<Kinds extends Kind.Kind> extends BaseOriginEntity<Props<Kinds>> {
        readonly kind = build.current.World._
        private readonly _ExternalOrigin: ExternalOriginEntity
        constructor(props: Props<Kinds>) {
            super("World", props, null)
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

                    const self: DefineScopedFile<Kinds, Scope> = {
                        metadata(input: Meta.Input) {
                            props = assign({}, props!, {
                                meta: Meta.splat(props?.meta, input)
                            })
                            return self
                        },
                        Resources<const Produced extends LiveRefable<Kinded<Kinds>>>(
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
}
export class ExternalOriginEntity extends BaseOriginEntity {
    kind = build.current.External._
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
export const k8ts_namespace = "k8ts.org/" as const
