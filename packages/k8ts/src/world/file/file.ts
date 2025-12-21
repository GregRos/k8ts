import {
    FwRef_Exports,
    Origin_Exporter,
    type KindedCtor,
    type Origin_Entity,
    type Origin_Exporter_Props,
    type Origin_Props,
    type Refable
} from "@k8ts/instruments"
import { doddle } from "doddle"
import type { v1 } from "../../kinds"
import { build } from "../k8ts-sys-kind"
import type { File_sName } from "../world"

export class File_Entity extends Origin_Exporter {
    #_ = (() => {
        this.meta.add("source.k8ts.org/", {
            "^file": this.name
        })
    })()
    get kind() {
        return build.current.File._
    }
}
export function File<
    Kinds extends KindedCtor[] = KindedCtor[],
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
    Kinds extends KindedCtor[] = KindedCtor[],
    Exports extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> extends Origin_Props<Kinds[number]> {
    kinds?: Kinds
    FILE(this: File_Entity, FILE: File_Scope<Kinds>): Iterable<Exports | FwRef_Exports<Exports>>
}

export class File_Scope<Kinds extends KindedCtor[]> {
    constructor(private readonly _file: File_Entity) {
        this.on = this._file.on
    }

    on: File_Entity["on"]

    Section<Exported extends Kinds[number]["prototype"] = Kinds[number]["prototype"]>(
        ns: Refable<v1.Namespace._>,
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

export interface File_Section_Props extends Origin_Exporter_Props {
    namespace: Refable<v1.Namespace._>
}

export class File_Section_Entity extends Origin_Exporter<File_Section_Props> {
    get kind() {
        return build.current.File.Section._
    }
    #_ = doddle(() => {
        this.meta.overwrite({
            namespace: this._props.namespace.name
        })
    }).pull()
}

export class File_Section_Scope {
    on: File_Section_Entity["on"]
    constructor(private readonly _section: File_Section_Entity) {
        this.on = this._section.on
    }
}

export type File<
    Kinds extends KindedCtor[] = KindedCtor[],
    T extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> = FwRef_Exports<T>
