import {
    Origin,
    type ForwardExports,
    type Origin_Props,
    type ResourceConstructor
} from "@k8ts/instruments"

import { File, type FileProps, type File_sName } from "./file"

export type WorldProps<Kinds extends ResourceConstructor[]> = Origin_Props<Kinds[number]>

export class WorldEntity<
    Kinds extends ResourceConstructor[] = ResourceConstructor[]
> extends Origin<WorldProps<Kinds>> {
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
        props: FileProps<Kinds, Exports>
    ) {
        return File(this, name, props) as ForwardExports<Exports>
    }
}

export const k8ts_namespace = "k8ts.org/" as const
