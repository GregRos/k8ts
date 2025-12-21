import { InstrumentsError } from "../../error"
import { displayers } from "../../utils/displayers"
import { bind_own_methods } from "../../utils/displayers/bind"
import { RefKey } from "../ref-key"
import { pluralize } from "./pluralize"

export type Kind<
    GroupName extends string = string,
    Version extends string = string,
    Name extends string = string
> = Kind.Kind<GroupName, Version, Name>
export namespace Kind {
    export interface IdentParent {
        text: string
        name: string
        dns: string
        parent: IdentParent | null
        equals(other: any): boolean
    }
    type _alphabeta = "alpha" | "beta" | ""
    type _subversion = `${_alphabeta}${number}` | ""
    type _version = `v${number}${_subversion | ""}`
    @displayers({
        simple: self => self.text
    })
    @bind_own_methods()
    export abstract class Identifier<
        Name extends string = string,
        Parent extends IdentParent | null = IdentParent | null
    > implements IdentParent
    {
        constructor(
            readonly name: Name,
            readonly parent: Parent
        ) {}

        get full(): IdentParent[] {
            const parts: IdentParent[] = []
            let curr: IdentParent | null = this
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

        abstract child(name: string): Identifier<
            string,
            {
                name: Name
            } & IdentParent
        >

        equals(other: any) {
            if (typeof other !== "object" || !other) {
                return false
            }
            if (!(other instanceof Identifier)) {
                return false
            }
            return this.text === other.text
        }
    }
    @bind_own_methods()
    export class Group<const _Group extends string = string> extends Identifier<_Group, null> {
        constructor(override name: _Group) {
            super(name, null)
        }
        version<Version extends _version>(apiVersion: Version) {
            return new Version(apiVersion, this)
        }

        child(name: string): Version<_Group, string> {
            if (!name.startsWith("v")) {
                throw new InstrumentsError(
                    `Invalid version name "${name}". Version name must start with "v".`
                )
            }
            return this.version(name as any) as any
        }
    }
    @bind_own_methods()
    export class Version<
        const _Group extends string = string,
        const _Version extends string = string
    > extends Identifier<_Version, Kind.Group<_Group>> {
        kind<_Kind extends string>(kind: _Kind) {
            return new Kind(kind, this as Version<_Group, _Version>)
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
    > extends Identifier<_Kind, Version<_Group, _Version>> {
        constructor(name: _Kind, parent: Version<_Group, _Version>) {
            super(name, parent)
        }

        refKey<Name extends string>(name: Name) {
            return new RefKey<this, Name>(this as any, name)
        }

        get plural() {
            return pluralize(this.name.toLowerCase())
        }
        get version() {
            return this.parent
        }

        get group() {
            return this.parent.parent
        }

        subkind<SubKind extends string>(subkind: SubKind) {
            return new SubKind(subkind, this)
        }

        child<Name extends string>(name: Name): SubKind<Name, this> {
            return this.subkind(name)
        }
    }

    @bind_own_methods()
    export class SubKind<
        Name extends string = string,
        Parent extends IdentParent = IdentParent
    > extends Identifier<Name, Parent> {
        constructor(name: Name, parent: Parent) {
            super(name, parent)
        }
        subkind<_SubKind2 extends string>(subkind: _SubKind2): SubKind<_SubKind2, this> {
            return new SubKind(subkind, this)
        }

        child<Name extends string>(name: Name) {
            return this.subkind(name)
        }
    }

    export function group<ApiGroup extends string>(apiGroup: ApiGroup) {
        return new Group(apiGroup)
    }

    export function version<ApiVersion extends _version>(apiVersion: ApiVersion) {
        return new Version(apiVersion, group(""))
    }
}
export function kinded(kind: Kind.Identifier) {
    return <T extends abstract new (...args: any[]) => object>(ctor: T) => {
        ctor.prototype.kind = kind
        return ctor
    }
}
