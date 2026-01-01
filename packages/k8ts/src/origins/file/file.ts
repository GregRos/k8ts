import {
    ForwardExports,
    Origin_Exporter,
    type Origin_Entity,
    type Origin_Props,
    type ResourceConstructor,
    type ResourceRef
} from "@k8ts/instruments"
import { doddlify, seq } from "doddle"
import type { v1 } from "../../idents"
import { Origin_Section, type File_Section_Props } from "./section"
export type File_sName = `${string}.yaml`
export interface File_Props<
    Kinds extends ResourceConstructor[] = ResourceConstructor[],
    Exports extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> extends Origin_Props<Kinds[number]> {
    kinds?: Kinds
    namespace?: ResourceRef<v1.Namespace._>
    FILE(FILE: Origin_File_Scope<Kinds>): Iterable<Exports | ForwardExports<Exports>>
}
export class Origin_File extends Origin_Exporter<File_Props> {
    #_ = (() => {
        this.meta.add("source.k8ts.org/", {
            "^file": this.name
        })
        this.meta.overwrite("namespace", this._props.namespace?.name)
    })()
    get ident() {
        return "[k8ts] File"
    }

    @doddlify
    protected __exports__() {
        return seq(
            this._props.FILE.call(this, new Origin_File_Scope(this) as any) as Iterable<ResourceRef>
        ).cache()
    }
}
export function File<
    Kinds extends ResourceConstructor[] = ResourceConstructor[],
    Exports extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
>(parent: Origin_Entity, name: File_sName, props: File_Props<Kinds, Exports>) {
    const file = new Origin_File(parent, name, props as any)

    return ForwardExports<Exports>(file)
}

export class Origin_File_Scope<Kinds extends ResourceConstructor[]> {
    constructor(private readonly _file: Origin_File) {
        this.on = this._file.on
    }
    get __entity__() {
        return this._file
    }
    on: Origin_File["on"]

    Section<Exported extends Kinds[number]["prototype"] = Kinds[number]["prototype"]>(
        name: string,
        props: File_Section_Props<Exported>
    ) {
        const section: Origin_Section = new Origin_Section(this._file, name, props)
        return ForwardExports<Exported>(section)
    }
}

export type File<
    Kinds extends ResourceConstructor[] = ResourceConstructor[],
    T extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> = ForwardExports<T>
