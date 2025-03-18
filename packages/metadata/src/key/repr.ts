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
        const parts = []
        if (this._section) {
            parts.push(this._section)
            if (!this._section.endsWith("/")) {
                parts.push("/")
            }
        }
        parts.push(this._name)
        return parts.join("")
    }

    get str() {
        return [this._prefix, this.suffix].join("")
    }

    get parent() {
        if (this._section == null) {
            return null
        }
        return new SectionKey(this._section)
    }

    section(section: string | SectionKey) {
        section = section instanceof SectionKey ? section.str : section
        if (this._section) {
            throw new Error("Already has a section")
        }
        return new ValueKey(this._prefix, section, this._name)
    }
}

export class SectionKey extends KeyType {
    type = "heading" as const
    constructor(readonly _section: string) {
        super()
    }

    get str() {
        return [this._section].join("")
    }
}

export type SomeKey = ValueKey | SectionKey
