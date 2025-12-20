import {
    ChildOriginEntity,
    OriginEntity,
    type Kind,
    type KindedCtor,
    type Origin_Props,
    type Refable
} from "@k8ts/instruments"

import { External } from "./external"
import { File_Entity, type File_Props } from "./file"
import { build } from "./k8ts-sys-kind"
export type File_sName = `${string}.yaml`

export type World_Props<Kinds extends KindedCtor[]> = Origin_Props<Kinds>

export class World<Kinds extends Kind.IdentParent[]> extends OriginEntity<World_Props<Kinds>> {
    readonly kind = build.current.World._
    private readonly _ExternalOrigin: ExternalOriginEntity
    constructor(name: string, props: World_Props<Kinds>) {
        super(name, props)

        this._ExternalOrigin = new ExternalOriginEntity(this)
    }

    External<K extends Kind>(kind: K, name: string, namespace?: string) {
        return new External(this._ExternalOrigin, kind.refKey(name), namespace)
    }

    File<ExtraKinds extends Kind.IdentParent[], Exports extends Refable<ExtraKinds[number]>>(
        name: File_sName,
        props: File_Props<[...ExtraKinds, ...Kinds], Exports>
    ) {
        const file = new File_Entity<[...ExtraKinds, ...Kinds], Exports>(this, name, props)
        return file["__exports__"]()
    }
}

export class ExternalOriginEntity extends ChildOriginEntity {
    kind = build.current.External._
    constructor(parent: OriginEntity) {
        super(parent, "External", {
            *exports() {}
        })
    }
}
export const k8ts_namespace = "k8ts.org/" as const
