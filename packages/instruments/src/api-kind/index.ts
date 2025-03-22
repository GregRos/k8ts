import { hash } from "immutable"
import { InstrumentsError } from "../error"

export type Kind<
    Name extends string = string,
    Version extends Kind.Version = Kind.Version
> = Kind.Kind<Name, Version>
export namespace Kind {
    export type InputVersion = `v${string}`

    export interface IdentParent {
        text: string
        name: string
        dns: string
    }

    export abstract class Identifier<
        Name extends string = string,
        Parent extends IdentParent | null = IdentParent | null
    > implements IdentParent
    {
        constructor(
            readonly name: Name,
            readonly parent: Parent
        ) {
            this.toString = () => this.text
        }
        get text(): string {
            return [this.parent?.text, this.name].filter(Boolean).join("/")
        }

        get dns() {
            return [this.name, this.parent?.dns].filter(Boolean).join(".")
        }

        abstract child<Name extends string>(name: Name): Identifier<Name, this>

        equals(other: any) {
            if (typeof other !== "object" || !other) {
                return false
            }
            if (!(other instanceof Identifier)) {
                return false
            }
            return this.text === other.text
        }

        private hashCode() {
            return hash(this.text)
        }
    }

    export class Group<const Name extends string = string> extends Identifier<Name, null> {
        constructor(override name: Name) {
            super(name, null)
        }
        version<Version extends InputVersion>(apiVersion: Version) {
            return new Version(apiVersion, this)
        }

        child<Name extends string>(name: Name): Version<Name, this> {
            if (!name.startsWith("v")) {
                throw new InstrumentsError(
                    `Invalid version name "${name}". Version name must start with "v".`
                )
            }
            return this.version(name as any)
        }
    }

    export class Version<
        const _Version extends string = string,
        const _Group extends Group = Group
    > extends Identifier<_Version, _Group> {
        kind<Kind extends string>(kind: Kind) {
            return new Kind(kind, this)
        }

        get group() {
            return this.parent
        }

        child<Name extends string>(name: Name): Kind<Name, this> {
            return this.kind(name)
        }
    }

    export class Kind<
        const Name extends string = string,
        const V extends Version = Version
    > extends Identifier<Name, V> {
        get version() {
            return this.parent
        }

        get group() {
            return this.parent?.parent
        }

        subkind<SubKind extends string>(subkind: SubKind) {
            return new SubKind(subkind, this)
        }

        child<Name extends string>(name: Name): SubKind<Name, this> {
            return this.subkind(name)
        }
    }

    export class SubKind<
        _SubKind extends string = string,
        _Parent extends Kind = Kind
    > extends Identifier<_SubKind, _Parent> {
        constructor(name: _SubKind, parent: _Parent) {
            super(name, parent)
        }

        subkind<SubKind extends string>(subkind: SubKind): never {
            throw new InstrumentsError(`SubKind "${this.text}" cannot have subkind "${subkind}".`)
        }

        child<Name extends string>(name: Name): never {
            return this.subkind(name)
        }
    }

    export function group<ApiGroup extends string>(apiGroup: ApiGroup) {
        return new Group(apiGroup)
    }

    export function version<ApiVersion extends InputVersion>(apiVersion: ApiVersion) {
        return new Version(apiVersion, group(""))
    }
}
export function kinded(kind: Kind.Identifier) {
    return <T extends abstract new (...args: any[]) => object>(ctor: T) => {
        ctor.prototype.kind = kind
        return ctor
    }
}
