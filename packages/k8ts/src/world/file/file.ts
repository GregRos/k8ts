import {
    ChildOriginEntity,
    type ChildOrigin_Props,
    type FwRef_Exports,
    type Kind,
    type Refable
} from "@k8ts/instruments"
import { build } from "../k8ts-sys-kind"
export interface File_Props<
    Kinds extends Kind.IdentParent[] = Kind.IdentParent[],
    Exports extends Refable<Kinds[number]> = Refable<Kinds[number]>
> {
    FILE(): Iterable<Exports>
}
export class File_Entity<
    Kinds extends Kind.IdentParent[] = Kind.IdentParent[],
    Exports extends Refable<Kinds[number]> = Refable<Kinds[number]>
> extends ChildOriginEntity<ChildOrigin_Props<Kinds, Exports>> {
    get kind() {
        return build.current.File._
    }
}

export type File<
    Kinds extends Kind.IdentParent[] = Kind.IdentParent[],
    T extends Refable<Kinds[number]> = Refable<Kinds[number]>
> = FwRef_Exports<File_Entity<Kinds, T>, T>
