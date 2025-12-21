import {
    FwRef_Exports,
    Origin_Exporter,
    type Origin_Entity,
    type Origin_Props,
    type Resource_Core_Ref,
    type Resource_Ctor_Of
} from "@k8ts/instruments"
import type { v1 } from "../../kinds"
import { File_Section_Entity } from "./section"
export type File_sName = `${string}.yaml`

export class File_Entity extends Origin_Exporter {
    #_ = (() => {
        this.meta.add("source.k8ts.org/", {
            "^file": this.name
        })
    })()
    get kind() {
        return "k8ts:File"
    }
}
export function File<
    Kinds extends Resource_Ctor_Of[] = Resource_Ctor_Of[],
    Exports extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
>(parent: Origin_Entity, name: File_sName, props: File_Props<Kinds, Exports>) {
    const file = new File_Entity(parent, name, {
        kinds: props.kinds,
        exports: (): Iterable<Exports> => {
            return props.FILE.call(file, new File_Scope(file) as any) as Iterable<Exports>
        },
        meta: props.meta ?? {}
    })

    return FwRef_Exports<Exports>(file)
}
export interface File_Props<
    Kinds extends Resource_Ctor_Of[] = Resource_Ctor_Of[],
    Exports extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> extends Origin_Props<Kinds[number]> {
    kinds?: Kinds
    FILE(this: File_Entity, FILE: File_Scope<Kinds>): Iterable<Exports | FwRef_Exports<Exports>>
}

export class File_Scope<Kinds extends Resource_Ctor_Of[]> {
    constructor(private readonly _file: File_Entity) {
        this.on = this._file.on
    }

    on: File_Entity["on"]

    Section<Exported extends Kinds[number]["prototype"] = Kinds[number]["prototype"]>(
        ns: Resource_Core_Ref<v1.Namespace._>,
        exports: (this: File_Section_Entity) => Iterable<Exported>
    ) {
        const section: File_Section_Entity = new File_Section_Entity(this._file, ns.name, {
            exports: () => {
                return exports.call(section)
            },
            namespace: ns
        })
        return FwRef_Exports<Exported>(section)
    }
}

export type File<
    Kinds extends Resource_Ctor_Of[] = Resource_Ctor_Of[],
    T extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> = FwRef_Exports<T>
