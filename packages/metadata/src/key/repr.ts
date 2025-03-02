import { hash } from "immutable"
interface ImmObject {
    equals(other: ImmObject): boolean
    hashCode(): number
}
abstract class KeyType implements ImmObject {
    abstract get str(): string
    equals(other: ImmObject): boolean {
        return this.constructor === other.constructor && this.toString() === other.toString()
    }
    hashCode(): number {
        return hash(this.toString())
    }
    toString() {
        return this.str
    }
}

export class ValueKey extends KeyType {
    type = "full" as const
    constructor(
        readonly _prefix: string,
        readonly _section: string | undefined,
        readonly _name: string
    ) {
        super()
    }

    get suffix() {
        return [this._section ?? "", this._name].join("")
    }

    get str() {
        return [this._prefix, this.suffix].join("")
    }

    get parent() {
        if (this._section == null) {
            return null
        }
        return new SectionKey(this._prefix, this._section)
    }
}

export class SectionKey extends KeyType {
    type = "heading" as const
    constructor(
        readonly _prefix: string,
        readonly _section: string
    ) {
        super()
    }

    get str() {
        return [this._prefix, this._section].join("")
    }

    toFullKey(name: string) {
        return new ValueKey(this._prefix, this._section, name)
    }
}

export type SomeKey = ValueKey | SectionKey
