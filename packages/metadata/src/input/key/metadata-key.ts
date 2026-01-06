import { isNullish } from "what-are-you"
import { K8tsMetadataError } from "../../error"
import { checkMetaString } from "../../utils/validate"
import { Metadata_Key_Base } from "./base"
import { Metadata_Key_Domain } from "./domain-prefix"
import type { Metadata_Key_sPrefix, Metadata_Key_sValue } from "./string-types"

export class Metadata_Key_Value extends Metadata_Key_Base {
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

    get str(): Metadata_Key_sValue {
        return [this._prefix, this.suffix].join("") as Metadata_Key_sValue
    }

    get parent() {
        if (!this._domain) {
            return null
        }
        return new Metadata_Key_Domain(this._domain)
    }

    prefix(): Metadata_Key_sPrefix
    prefix(prefix: Metadata_Key_sPrefix): this
    prefix(prefix?: any) {
        if (isNullish(prefix)) {
            return this._prefix as Metadata_Key_sPrefix
        }
        return new Metadata_Key_Value(prefix, this._domain, this._name)
    }

    name(): string
    name(name: string): this
    name(name?: any) {
        if (isNullish(name)) {
            return this._name
        }
        return new Metadata_Key_Value(this._prefix, this._domain, name)
    }

    domain(): Metadata_Key_Domain
    domain(domain: string | Metadata_Key_Domain): this
    domain(domain?: any) {
        if (isNullish(domain)) {
            return this._domain ? new Metadata_Key_Domain(this._domain) : null
        }
        domain = domain instanceof Metadata_Key_Domain ? domain.str : domain
        if (this._domain) {
            throw new K8tsMetadataError("Already has a domain")
        }
        return new Metadata_Key_Value(this._prefix, domain, this._name)
    }
}
