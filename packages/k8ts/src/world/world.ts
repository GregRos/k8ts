import {
    Origin_Entity,
    Origin_Exporter,
    type FwRef_Exports,
    type Kind,
    type KindedCtor,
    type Origin_Props
} from "@k8ts/instruments"

import { External } from "./external"
import { File, type File_Props } from "./file"
import { build } from "./k8ts-sys-kind"
export type File_sName = `${string}.yaml`

export type World_Props<Kinds extends KindedCtor[]> = Origin_Props<Kinds[number]>

export class World<Kinds extends KindedCtor[] = KindedCtor[]> extends Origin_Entity<
    World_Props<Kinds>
> {
    readonly kind = build.current.World._
    private readonly _ExternalOrigin = new ExternalOriginEntity(this)
    #_ = (() => {
        this.meta.add("source.k8ts.org/", {
            "^world": this.name
        })
    })()

    External<K extends Kind, Name extends string>(kind: K, name: Name, namespace?: string) {
        return new External(this._ExternalOrigin, kind.refKey(name), namespace)
    }

    File<Exports extends KindedCtor["prototype"], ExtraKinds extends KindedCtor[] = []>(
        name: File_sName,
        props: File_Props<[...ExtraKinds, ...Kinds], Exports>
    ) {
        return File(this, name, props) as FwRef_Exports<Exports>
    }
}

export class ExternalOriginEntity extends Origin_Exporter {
    get kind() {
        return build.current.External._
    }
    constructor(parent: Origin_Entity) {
        super(parent, "External", {
            *exports() {}
        })
    }
}
export const k8ts_namespace = "k8ts.org/" as const
