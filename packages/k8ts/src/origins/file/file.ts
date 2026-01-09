import {
    ExporterOrigin,
    ForwardExports,
    type Origin_Props,
    type ResourceRef,
    type ResourceRef_Constructor
} from "@k8ts/instruments"
import { doddlify, seq } from "doddle"
import type { v1 } from "../../kinds"
import { K8tsFile_Section, type K8tsFile_Section_Props } from "./section"
export type File_sName = `${string}.yaml`
export interface K8tsFile_Props<
    Kinds extends ResourceRef_Constructor[] = ResourceRef_Constructor[],
    Exports extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> extends Origin_Props<Kinds[number]> {
    kinds?: Kinds
    namespace?: ResourceRef<v1.Namespace._>
    File(FILE: K8tsFile_Scope<Kinds>): Iterable<Exports | ForwardExports<Exports>>
}
export class K8tsFile extends ExporterOrigin<K8tsFile_Props> {
    #_ = (() => {
        this.metadata.add("source.k8ts.org/", {
            "^file": this.name
        })
    })()
    get kind() {
        return "[k8ts] File"
    }

    get namespace() {
        return this._props.namespace?.ident.name
    }

    @doddlify
    protected __exports__() {
        return seq(
            this._props.File.call(this, new K8tsFile_Scope(this) as any) as Iterable<ResourceRef>
        ).cache()
    }
}

export class K8tsFile_Scope<Kinds extends ResourceRef_Constructor[]> {
    constructor(private readonly _file: K8tsFile) {
        this.on = this._file.on
    }
    get __entity__() {
        return this._file
    }
    on: K8tsFile["on"]

    Section<Exported extends Kinds[number]["prototype"] = Kinds[number]["prototype"]>(
        name: string,
        props: K8tsFile_Section_Props<Exported>
    ) {
        const section: K8tsFile_Section = new K8tsFile_Section(this._file, name, props)
        return ForwardExports<Exported>(section)
    }
}
