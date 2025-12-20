import { displayers } from "../../../displayers"
import { InstrumentsError } from "../../../error"
import type { Cli_Value } from "./types"

export class Cli_Flag {
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

export type Cli_sTermJoiner = "=" | " "

@displayers({
    simple: s => s.str("=")
})
export class Cli_OptionValueTerm {
    constructor(
        private readonly key: string,
        private readonly overrideTermJoiner: string | undefined,
        private readonly value: Cli_Value
    ) {}

    get isMissing() {
        return this.value === null
    }

    private _valueStr() {
        if (this.value === null) {
            throw new Error("Shouldn't be here")
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

export class Cli_VerbatimTerm {
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

export type CliTerm = Cli_Flag | Cli_OptionValueTerm | Cli_VerbatimTerm
