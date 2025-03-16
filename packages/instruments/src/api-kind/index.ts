import { hash } from "immutable"

export type Kind<
    Group extends string = string,
    Version extends Kind.InputVersion = Kind.InputVersion,
    Name extends string = string
> = Kind.Kind<Group, Version, Name>
export namespace Kind {
    export type InputVersion = `v${string}`

    export interface IdentParent {
        text: string
        name: string
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

    class _Group<const Name extends string = string> extends Identifier<Name, null> {
        constructor(override name: Name) {
            super(name, null)
        }
        version<Version extends InputVersion>(apiVersion: Version) {
            return new _Version(apiVersion, this)
        }
    }

    export class _Version<
        const Group extends string = string,
        const Name extends InputVersion = InputVersion
    > extends Identifier<Name, _Group<Group>> {
        kind<Kind extends string>(kind: Kind) {
            return new Kind(kind, this)
        }

        get group() {
            return this.parent
        }
    }

    export class Kind<
        const Group extends string = string,
        const V extends InputVersion = InputVersion,
        const Name extends string = string
    > extends Identifier<Name, _Version<Group, V>> {
        get version() {
            return this.parent
        }

        get group() {
            return this.parent?.parent
        }

        subkind(subkind: string) {
            return new SubKind(subkind, this)
        }
    }

    export class SubKind extends Identifier<string, Kind> {}

    export function group<ApiGroup extends string>(apiGroup: ApiGroup) {
        return new _Group(apiGroup)
    }

    export function version<ApiVersion extends InputVersion>(apiVersion: ApiVersion) {
        return new _Version(apiVersion, group(""))
    }
}
