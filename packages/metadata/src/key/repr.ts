import { MetadataError } from "../error"
import { normalChar } from "./parse-key"
interface ImmObject {
    equals(other: ImmObject): boolean
}

abstract class KeyType implements ImmObject {
    abstract get str(): string
    equals(other: ImmObject): boolean {
        return this.constructor === other.constructor && this.toString() === other.toString()
    }

    toString() {
        return this.str
    }
}

export function checkMetaString(thing: string, input: string, length: number) {
    if (!normalChar.parse(input[0]!).isOk) {
        throw new MetadataError(`${thing} must start with an alphanumeric character.`)
    }
    if (!normalChar.parse(input[input.length - 1]!).isOk) {
        throw new MetadataError(`${thing}  must end with an alphanumeric character.`)
    }
    if (thing.length > length) {
        throw new MetadataError(`${thing} must be no more than ${length} characters.`)
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
        if (_section) {
            checkMetaString(`DNS prefix for ${this.str}`, _section, 253)
        }
        checkMetaString(`Metadata name of ${this.str}`, _name, 63)
    }

    get metaType() {
        switch (this._prefix) {
            case "":
                return "core"
            case "%":
                return "label"
            case "#":
                return "comment"
            case "^":
                return "annotation"
            default:
                throw new Error(`Unknown prefix ${this._prefix}`)
        }
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
        if (!this._section) {
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
        checkMetaString(`Section name ${this._section}`, _section, 253)
    }

    get str() {
        return [this._section].join("")
    }
}

export type SomeKey = ValueKey | SectionKey
