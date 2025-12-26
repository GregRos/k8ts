import {
    Origin_Entity,
    type Origin_Props,
    type Rsc_Ctor_Of,
    type Rsc_FwRef_Exports
} from "@k8ts/instruments"

import { File, type File_Props, type File_sName } from "./file"

export type World_Props<Kinds extends Rsc_Ctor_Of[]> = Origin_Props<Kinds[number]>

export class World_Entity<Kinds extends Rsc_Ctor_Of[] = Rsc_Ctor_Of[]> extends Origin_Entity<
    World_Props<Kinds>
> {
    get kind() {
        return "[k8ts] World"
    }
    #_ = (() => {
        this.meta.add("source.k8ts.org/", {
            "^world": this.name
        })
    })()

    File<Exports extends Rsc_Ctor_Of["prototype"]>(
        name: File_sName,
        props: File_Props<Kinds, Exports>
    ) {
        return File(this, name, props) as Rsc_FwRef_Exports<Exports>
    }
}

export const k8ts_namespace = "k8ts.org/" as const
