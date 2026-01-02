import {
    ForwardExports,
    OriginExporter,
    type OriginEntity,
    type OriginProps,
    type ResourceConstructor,
    type ResourceRef
} from "@k8ts/instruments"
import { doddlify, seq } from "doddle"
import type { v1 } from "../../resources/idents"
import { OriginSection, type FileSectionProps } from "./section"
export type File_sName = `${string}.yaml`
export interface FileProps<
    Kinds extends ResourceConstructor[] = ResourceConstructor[],
    Exports extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> extends OriginProps<Kinds[number]> {
    kinds?: Kinds
    namespace?: ResourceRef<v1.Namespace._>
    FILE(FILE: OriginFileScope<Kinds>): Iterable<Exports | ForwardExports<Exports>>
}
export class OriginFile extends OriginExporter<FileProps> {
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
            this._props.FILE.call(this, new OriginFileScope(this) as any) as Iterable<ResourceRef>
        ).cache()
    }
}
export function File<
    Kinds extends ResourceConstructor[] = ResourceConstructor[],
    Exports extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
>(parent: OriginEntity, name: File_sName, props: FileProps<Kinds, Exports>) {
    const file = new OriginFile(parent, name, props as any)

    return ForwardExports<Exports>(file)
}

export class OriginFileScope<Kinds extends ResourceConstructor[]> {
    constructor(private readonly _file: OriginFile) {
        this.on = this._file.on
    }
    get __entity__() {
        return this._file
    }
    on: OriginFile["on"]

    Section<Exported extends Kinds[number]["prototype"] = Kinds[number]["prototype"]>(
        name: string,
        props: FileSectionProps<Exported>
    ) {
        const section: OriginSection = new OriginSection(this._file, name, props)
        return ForwardExports<Exported>(section)
    }
}

export type File<
    Kinds extends ResourceConstructor[] = ResourceConstructor[],
    T extends Kinds[number]["prototype"] = Kinds[number]["prototype"]
> = ForwardExports<T>
