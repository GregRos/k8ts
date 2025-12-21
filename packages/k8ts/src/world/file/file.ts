import {
    ChildOriginEntity,
    FwRef_Exports,
    type ChildOrigin_Props,
    type KindedCtor,
    type Origin_Props,
    type OriginEntity,
    type Refable
} from "@k8ts/instruments"
import { doddle } from "doddle"
import type { v1 } from "../../kinds"
import { build } from "../k8ts-sys-kind"
import type { File_sName } from "../world"

export class File_Entity extends ChildOriginEntity {
    #_ = (() => {
        this.meta.add("build.k8ts.org/", {
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
>(parent: OriginEntity, name: File_sName, props: File_Props<Kinds, Exports>) {
    const file = new File_Entity(parent, name, {
        kinds: props.kinds,
        exports: (): Iterable<Exports> => {
            return props.FILE(new File_Scope(file, props.kinds ?? []) as any) as Iterable<Exports>
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
    FILE(FILE: File_Scope<Kinds>): Iterable<Exports | FwRef_Exports<Exports>>
}

export class File_Scope<Kinds extends KindedCtor[]> {
    constructor(
        private readonly _file: File_Entity,
        private readonly _kinds: Kinds
    ) {}

    Section<Exported extends Kinds[number]["prototype"] = Kinds[number]["prototype"]>(
        ns: Refable<v1.Namespace._>,
        exports: () => Iterable<Exported>
    ) {
        const section = new File_Section_Entity(this._file, ns.name, {
            exports: exports,
            namespace: ns
        })
        return FwRef_Exports<Exported>(section)
    }
}

export interface File_Section_Props extends ChildOrigin_Props {
    namespace: Refable<v1.Namespace._>
}

export class File_Section_Entity extends ChildOriginEntity<File_Section_Props> {
    get kind() {
        return build.current.File.Section._
    }
    #_ = doddle(() => {
        this.meta.overwrite({
            namespace: this._props.namespace.name
        })
    }).pull()
}

export type File<
    Kinds extends KindedCtor[] = KindedCtor[],
    T extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> = FwRef_Exports<T>
