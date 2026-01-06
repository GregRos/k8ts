import { checkMetaString } from "../../utils/validate"
import { Metadata_Key_Base } from "./base"

export class Metadata_Key_Domain extends Metadata_Key_Base {
    type = "domain" as const
    constructor(private readonly _domain: string) {
        super()
        checkMetaString(`Section name ${this._domain}`, _domain, 253)
    }

    get str() {
        return [this._domain].join("")
    }
}
