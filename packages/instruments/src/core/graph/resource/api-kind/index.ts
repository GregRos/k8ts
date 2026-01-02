import { InstrumentsError } from "../../../../error"
import { bind_own_methods } from "../../../../utils"
import { displayers } from "../../../../utils/displayers"
import { ResourceKey, type RefKey_Options } from "../ref-key"
import { pluralize } from "./pluralize"

export interface IdentLike {
    text: string
    name: string
    dns: string
    parent: IdentLike | null
    equals(other: any): boolean
}
type _alphabeta = "alpha" | "beta" | ""
type _subversion = `${_alphabeta}${number}` | ""
type _version = `v${number}${_subversion | ""}`

@displayers({
    simple: self => self.text
})
@bind_own_methods()
export abstract class Ident<
    Name extends string = string,
    Parent extends IdentLike | null = IdentLike | null
> implements IdentLike
{
    constructor(
        readonly name: Name,
        readonly parent: Parent
    ) {}

    get full(): IdentLike[] {
        const parts: IdentLike[] = []
        let curr: IdentLike | null = this
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
        } & IdentLike
    >

    equals(other: any) {
        if (!other) {
            return false
        }
        if (typeof other === "string") {
            return this.text === other
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
export class IdentGroup<const _Group extends string = string> extends Ident<_Group, null> {
    constructor(override name: _Group) {
        super(name, null)
    }
    version<Version extends _version>(apiVersion: Version) {
        return new IdentVersion(apiVersion, this)
    }

    child(name: string): IdentVersion<_Group, string> {
        if (!name.startsWith("v")) {
            throw new InstrumentsError(
                `Invalid version name "${name}". Version name must start with "v".`
            )
        }
        return this.version(name as any) as any
    }
}
@bind_own_methods()
export class IdentVersion<
    const _Group extends string = string,
    const _Version extends string = string
> extends Ident<_Version, IdentGroup<_Group>> {
    kind<_Kind extends string>(kind: _Kind, specialPlural?: string) {
        return new IdentKind(kind, this as IdentVersion<_Group, _Version>, specialPlural)
    }

    __FORMAT__!: _Version

    get group() {
        return this.parent
    }

    child(name: string): IdentKind<_Group, _Version, string> {
        return this.kind(name)
    }
}
@bind_own_methods()
export class IdentKind<
    const _Group extends string = string,
    const _Version extends string = string,
    const _Kind extends string = string
> extends Ident<_Kind, IdentVersion<_Group, _Version>> {
    constructor(
        name: _Kind,
        parent: IdentVersion<_Group, _Version>,
        private readonly _specialPlural?: string
    ) {
        super(name, parent)
    }

    refKey<Name extends string>(options: RefKey_Options<Name>) {
        return new ResourceKey<this, Name>(this as any, options)
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
        return new IdentResourcePart(subkind, this)
    }

    child<Name extends string>(name: Name): IdentResourcePart<Name, this> {
        return this.subkind(name)
    }
}

@bind_own_methods()
export class IdentResourcePart<
    Name extends string = string,
    Parent extends IdentLike = IdentLike
> extends Ident<Name, Parent> {
    constructor(name: Name, parent: Parent) {
        super(name, parent)
    }
    subkind<_SubKind2 extends string>(subkind: _SubKind2): IdentResourcePart<_SubKind2, this> {
        return new IdentResourcePart(subkind, this)
    }

    child<Name extends string>(name: Name) {
        return this.subkind(name)
    }
}

export function group<ApiGroup extends string>(apiGroup: ApiGroup) {
    return new IdentGroup(apiGroup)
}

export function version<ApiVersion extends _version>(apiVersion: ApiVersion) {
    return new IdentVersion(apiVersion, group(""))
}
