import {
    Origin_Entity,
    type ForwardExports,
    type Origin_Props,
    type ResourceConstructor
} from "@k8ts/instruments"

import { File, type File_Props, type File_sName } from "./file"

export type World_Props<Kinds extends ResourceConstructor[]> = Origin_Props<Kinds[number]>

export class World_Entity<
    Kinds extends ResourceConstructor[] = ResourceConstructor[]
> extends Origin_Entity<World_Props<Kinds>> {
    get ident() {
        return "[k8ts] World"
    }
    #_ = (() => {
        this.meta.add("source.k8ts.org/", {
            "^world": this.name
        })
    })()

    File<Exports extends ResourceConstructor["prototype"]>(
        name: File_sName,
        props: File_Props<Kinds, Exports>
    ) {
        return File(this, name, props) as ForwardExports<Exports>
    }
}

export const k8ts_namespace = "k8ts.org/" as const
