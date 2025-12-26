import { InstrumentsError } from "../../../../error"
import { bind_own_methods } from "../../../../utils"
import { displayers } from "../../../../utils/displayers"
import { RefKey, type RefKey_Options } from "../ref-key"
import { pluralize } from "./pluralize"

export type Kind<
    GroupName extends string = string,
    Version extends string = string,
    Name extends string = string
> = Kind.Kind<GroupName, Version, Name>
export namespace Kind {
    export interface Ident_Like {
        text: string
        name: string
        dns: string
        parent: Ident_Like | null
        equals(other: any): boolean
    }
    type _alphabeta = "alpha" | "beta" | ""
    type _subversion = `${_alphabeta}${number}` | ""
    type _version = `v${number}${_subversion | ""}`
    export type _Kind_Parents<T extends Ident_Like> = T extends {
        subkind(...args: any[]): Ident_Like
        parent: infer P extends Ident_Like
    }
        ? [T, ..._Kind_Parents<P>]
        : []

    export type _Names_For_kind_Parents<T extends Ident_Like> = {
        [K in keyof _Kind_Parents<T>]: string
    }
    @displayers({
        simple: self => self.text
    })
    @bind_own_methods()
    export abstract class Ident<
        Name extends string = string,
        Parent extends Ident_Like | null = Ident_Like | null
    > implements Ident_Like
    {
        constructor(
            readonly name: Name,
            readonly parent: Parent
        ) {}

        get full(): Ident_Like[] {
            const parts: Ident_Like[] = []
            let curr: Ident_Like | null = this
            while (curr) {
                parts.unshift(curr)
                curr = curr.parent
            }
            return parts.filter(x => x.name)
        }

        get text(): string {
            return this.full.map(p => p.name).join("/") as any
        }

        get dns(): string {
            return this.full
                .map(x => x.name)
                .filter(Boolean)
                .join(".")
        }

        abstract child(name: string): Ident<
            string,
            {
                name: Name
            } & Ident_Like
        >

        equals(other: any) {
            if (!other) {
                return false
            }
            if (typeof other !== "object" || !other) {
                return false
            }
            if (!(other instanceof Ident)) {
                return false
            }
            return this.text === other.text
        }
    }
    @bind_own_methods()
    export class Ident_Group<const _Group extends string = string> extends Ident<_Group, null> {
        constructor(override name: _Group) {
            super(name, null)
        }
        version<Version extends _version>(apiVersion: Version) {
            return new Ident_Version(apiVersion, this)
        }

        child(name: string): Ident_Version<_Group, string> {
            if (!name.startsWith("v")) {
                throw new InstrumentsError(
                    `Invalid version name "${name}". Version name must start with "v".`
                )
            }
            return this.version(name as any) as any
        }
    }
    @bind_own_methods()
    export class Ident_Version<
        const _Group extends string = string,
        const _Version extends string = string
    > extends Ident<_Version, Kind.Ident_Group<_Group>> {
        kind<_Kind extends string>(kind: _Kind, specialPlural?: string) {
            return new Kind(kind, this as Ident_Version<_Group, _Version>, specialPlural)
        }

        __FORMAT__!: _Version

        get group() {
            return this.parent
        }

        child(name: string): Kind<_Group, _Version, string> {
            return this.kind(name)
        }
    }
    @bind_own_methods()
    export class Kind<
        const _Group extends string = string,
        const _Version extends string = string,
        const _Kind extends string = string
    > extends Ident<_Kind, Ident_Version<_Group, _Version>> {
        constructor(
            name: _Kind,
            parent: Ident_Version<_Group, _Version>,
            private readonly _specialPlural?: string
        ) {
            super(name, parent)
        }

        refKey<Name extends string>(options: RefKey_Options<Name>) {
            return new RefKey<this, Name>(this as any, options)
        }

        get plural() {
            return this._specialPlural ?? pluralize(this.name.toLowerCase())
        }
        get version() {
            return this.parent
        }

        get group() {
            return this.parent.parent
        }

        subkind<SubKind extends string>(subkind: SubKind) {
            return new Ident_SubKind(subkind, this)
        }

        child<Name extends string>(name: Name): Ident_SubKind<Name, this> {
            return this.subkind(name)
        }
    }

    @bind_own_methods()
    export class Ident_SubKind<
        Name extends string = string,
        Parent extends Ident_Like = Ident_Like
    > extends Ident<Name, Parent> {
        constructor(name: Name, parent: Parent) {
            super(name, parent)
        }
        subkind<_SubKind2 extends string>(subkind: _SubKind2): Ident_SubKind<_SubKind2, this> {
            return new Ident_SubKind(subkind, this)
        }

        child<Name extends string>(name: Name) {
            return this.subkind(name)
        }
    }

    export function group<ApiGroup extends string>(apiGroup: ApiGroup) {
        return new Ident_Group(apiGroup)
    }

    export function version<ApiVersion extends _version>(apiVersion: ApiVersion) {
        return new Ident_Version(apiVersion, group(""))
    }
}
