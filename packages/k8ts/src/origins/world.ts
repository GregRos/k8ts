import {
    Origin_Entity,
    type FwRef_Exports,
    type Kind,
    type Origin_Props,
    type Resource_Ctor_Of
} from "@k8ts/instruments"

import { External } from "../resources/external"
import { Origin_External } from "./external"
import { File, type File_Props, type File_sName } from "./file"

export type World_Props<Kinds extends Resource_Ctor_Of[]> = Origin_Props<Kinds[number]>

export class World_Entity<
    Kinds extends Resource_Ctor_Of[] = Resource_Ctor_Of[]
> extends Origin_Entity<World_Props<Kinds>> {
    get kind() {
        return "[k8ts] World"
    }
    private readonly _ExternalOrigin = new Origin_External(this)
    #_ = (() => {
        this.meta.add("source.k8ts.org/", {
            "^world": this.name
        })
    })()

    External<K extends Kind, Name extends string>(kind: K, name: Name, namespace?: string) {
        return new External(this._ExternalOrigin, kind.refKey(name), namespace)
    }


    File<Exports extends Resource_Ctor_Of["prototype"]>(
        name: File_sName,
        props: File_Props<Kinds, Exports>
    ) {
        return File(this, name, props) as FwRef_Exports<Exports>
    }
}

export const k8ts_namespace = "k8ts.org/" as const
