import {
    ForwardExports,
    OriginEntity,
    type Origin_Props,
    type ResourceRef_Constructor
} from "@k8ts/instruments"

import { K8tsFile, type File_sName, type K8tsFile_Props } from "./file"

export type K8tsWorld_Base_Props<Kinds extends ResourceRef_Constructor[]> = Origin_Props<
    Kinds[number]
>

export class K8tsWorld_Base<
    Kinds extends ResourceRef_Constructor[] = ResourceRef_Constructor[]
> extends OriginEntity<K8tsWorld_Base_Props<Kinds>> {
    get kind() {
        return "[k8ts] World"
    }
    #_ = (() => {
        this.metadata.add("source.k8ts.org/", {
            "^world": this.name
        })
    })()
    get namespace() {
        return undefined
    }
    File<Exports extends ResourceRef_Constructor["prototype"]>(
        name: File_sName,
        props: K8tsFile_Props<Kinds, Exports>
    ) {
        const file = new K8tsFile(this, name, props as any)

        return ForwardExports<Exports>(file)
    }
}

export const k8ts_namespace = "k8ts.org/" as const
