import { isNullish } from "what-are-you"
import { K8tsMetadataError } from "../../error"
import { checkMetaString } from "../../utils/validate"
import { BaseKey } from "./base"
import { DomainPrefix } from "./domain-prefix"
import type { Metadata_Key_OfValue, Metadata_Prefix_Any } from "./string-types"

export class MetadataKey extends BaseKey {
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
                throw new K8tsMetadataError(`Unknown prefix ${this._prefix}`)
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

    get str(): Metadata_Key_OfValue {
        return [this._prefix, this.suffix].join("") as Metadata_Key_OfValue
    }

    get parent() {
        if (!this._domain) {
            return null
        }
        return new DomainPrefix(this._domain)
    }

    prefix(): Metadata_Prefix_Any
    prefix(prefix: Metadata_Prefix_Any): this
    prefix(prefix?: any) {
        if (isNullish(prefix)) {
            return this._prefix as Metadata_Prefix_Any
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
            throw new K8tsMetadataError("Already has a domain")
        }
        return new MetadataKey(this._prefix, domain, this._name)
    }
}
