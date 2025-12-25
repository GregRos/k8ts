import { isNullish } from "what-are-you"
import { MetadataError } from "../error"
import { normalChar } from "./parse-key"
import type { Char } from "./types"
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

export class MetadataKey extends KeyType {
    type = "full" as const
    constructor(
        private readonly _prefix: string,
        private readonly _domain: string | undefined,
        private readonly _name: string
    ) {
        super()
        if (_domain) {
            checkMetaString(`DNS prefix for ${this.str}`, _domain, 253)
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
        if (this._domain) {
            parts.push(this._domain)
            if (!this._domain.endsWith("/")) {
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
        if (!this._domain) {
            return null
        }
        return new DomainPrefix(this._domain)
    }

    prefix(): Char.Prefix.Any
    prefix(prefix: Char.Prefix.Any): this
    prefix(prefix?: any) {
        if (isNullish(prefix)) {
            return this._prefix as Char.Prefix.Any
        }
        return new MetadataKey(prefix, this._domain, this._name)
    }

    name(): string
    name(name: string): this
    name(name?: any) {
        if (isNullish(name)) {
            return this._name
        }
        return new MetadataKey(this._prefix, this._domain, name)
    }

    domain(): DomainPrefix
    domain(domain: string | DomainPrefix): this
    domain(domain?: any) {
        if (isNullish(domain)) {
            return this._domain ? new DomainPrefix(this._domain) : null
        }
        domain = domain instanceof DomainPrefix ? domain.str : domain
        if (this._domain) {
            throw new Error("Already has a domain")
        }
        return new MetadataKey(this._prefix, domain, this._name)
    }
}

export class DomainPrefix extends KeyType {
    type = "domain" as const
    constructor(private readonly _domain: string) {
        super()
        checkMetaString(`Section name ${this._domain}`, _domain, 253)
    }

    get str() {
        return [this._domain].join("")
    }
}

export type SomeKey = MetadataKey | DomainPrefix
