import {
    BaseOriginEntity,
    LiveRefable,
    Origin,
    type Kind,
    type Kinded,
    type OriginEntityProps
} from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { assign } from "lodash"
import { External } from "./external"
import { File } from "./file"
import { FileExports } from "./file/exports"
import type { FileOrigin } from "./file/origin"
import { build } from "./k8ts-sys-kind"
export type ManifestFileName = `${string}.yaml`

export namespace World {
    export type DefineScopedFile<Kinds extends Kind.IdentParent, Scope extends FileOrigin.Scope> = {
        metadata(input: Meta.Input): DefineScopedFile<Kinds, Scope>
        Resources<const Produced extends LiveRefable<Kinded<Kinds>>>(
            producer: FileExports.Producer<Produced>
        ): File<Produced>
    }
    export type Props<Kinds extends Kind.IdentParent[] = Kind.IdentParent[]> =
        OriginEntityProps<Kinds>
    export class Builder<Kinds extends Kind.IdentParent[]> extends BaseOriginEntity<
        OriginEntityProps<Kinds>
    > {
        readonly kind = build.current.World._
        private readonly _ExternalOrigin: ExternalOriginEntity
        constructor(name: string, props: Props<Kinds>) {
            super(name, props)

            this._ExternalOrigin = new ExternalOriginEntity(this.node)
        }

        External<K extends Kind>(kind: K, name: string, namespace?: string) {
            return new External(this._ExternalOrigin, kind.refKey(name), namespace)
        }

        Scope<const Scope extends FileOrigin.Scope>(scope: Scope) {
            const builder = this
            let meta = Meta.make()
            return {
                File(name: ManifestFileName, props?: FileOrigin.SmallerProps) {
                    props ??= {}

                    const self: DefineScopedFile<Kinds[number], Scope> = {
                        metadata(input: Meta.Input) {
                            props = assign({}, props!, {
                                meta: Meta.splat(props?.meta, input)
                            })
                            return self
                        },
                        Resources<const Produced extends LiveRefable<Kinded<Kinds[number]>>>(
                            producer: FileExports.Producer<Produced>
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
            return File.make(name, props, this)
        }
    }
}
export class ExternalOriginEntity extends BaseOriginEntity {
    kind = build.current.External._
    constructor(parent: Origin) {
        super("EXTERNAL", {})
    }
}
export const k8ts_namespace = "k8ts.org/" as const
