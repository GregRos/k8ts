import { checkMetaString } from "../../utils/validate"
import { BaseKey } from "./base"

export class DomainPrefix extends BaseKey {
    type = "domain" as const
    constructor(private readonly _domain: string) {
        super()
        checkMetaString(`Section name ${this._domain}`, _domain, 253)
    }

    get str() {
        return [this._domain].join("")
    }
}
