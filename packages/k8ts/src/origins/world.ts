import {
    ForwardExports,
    Origin,
    type Origin_Props,
    type ResourceRef_Constructor
} from "@k8ts/instruments"

import { OriginFile, type FileProps, type File_sName } from "./file"

export type WorldProps<Kinds extends ResourceRef_Constructor[]> = Origin_Props<Kinds[number]>

export class WorldEntity<
    Kinds extends ResourceRef_Constructor[] = ResourceRef_Constructor[]
> extends Origin<WorldProps<Kinds>> {
    get ident() {
        return "[k8ts] World"
    }
    #_ = (() => {
        this.metadata.add("source.k8ts.org/", {
            "^world": this.name
        })
    })()

    File<Exports extends ResourceRef_Constructor["prototype"]>(
        name: File_sName,
        props: FileProps<Kinds, Exports>
    ) {
        const file = new OriginFile(this, name, props as any)

        return ForwardExports<Exports>(file)
    }
}

export const k8ts_namespace = "k8ts.org/" as const
