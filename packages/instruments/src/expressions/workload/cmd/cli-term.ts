import { InstrumentsError } from "../../../error"
import { displayers } from "../../../utils/displayers"
import { K8tsWorkloadToolsError } from "../error"
import type { CmdLine_Value } from "./types"

export class CmdLine_Term_Flag {
    constructor(readonly key: string) {}

    str(joiner: string) {
        return this.key
    }

    arr() {
        return [this.key]
    }

    get isMissing() {
        return false
    }
}

export type CmdLine_sTermJoiner = "=" | " "

@displayers({
    simple: s => s.str("=")
})
export class CmdLine_Term_Value {
    constructor(
        private readonly key: string,
        private readonly overrideTermJoiner: string | undefined,
        private readonly value: CmdLine_Value
    ) {}

    get isMissing() {
        return this.value === null
    }

    private _valueStr() {
        if (this.value === null) {
            throw new K8tsWorkloadToolsError("Shouldn't be here")
        }
        if (this.value === "") {
            return `""`
        }
        return `${this.value}`
    }

    str(joiner: string) {
        if (this.value === undefined) {
            throw new InstrumentsError("CliOptionValue cannot be undefined, use null instead")
        }

        return [this.key, this._valueStr()].join(this.overrideTermJoiner ?? joiner)
    }

    arr(joiner: string) {
        joiner = this.overrideTermJoiner ?? joiner
        if (joiner === " ") {
            return [this.key, this._valueStr()]
        }
        return [this.str(joiner)]
    }
}

export class CmdLine_Term_Verbatim {
    constructor(readonly value: string) {}

    str(joiner: string) {
        return this.value
    }

    arr() {
        return [this.value]
    }

    get isMissing() {
        return false
    }
}

export type CmdLine_Term = CmdLine_Term_Flag | CmdLine_Term_Value | CmdLine_Term_Verbatim
