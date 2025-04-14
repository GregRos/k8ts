import { displayers } from "../displayers"
import { InstrumentsError } from "../error"
import type { CliValue } from "./types"

export class CliFlag {
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

export type ValueTermJoiner = "=" | " "

@displayers({
    simple: s => s.str("=")
})
export class CliOptionValue {
    constructor(
        private readonly key: string,
        private readonly overrideTermJoiner: string | undefined,
        private readonly value: CliValue
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

export class VerbatimTerm {
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

export type CliTerm = CliFlag | CliOptionValue | VerbatimTerm
