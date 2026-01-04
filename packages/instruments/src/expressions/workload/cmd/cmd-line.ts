import { seq } from "doddle"
import { defaultsDeep, merge } from "lodash"
import { displayers } from "../../../utils/displayers"
import {
    CmdLine_Term_Flag,
    CmdLine_Term_Value,
    CmdLine_Term_Verbatim,
    type CmdLine_sTermJoiner,
    type CmdLine_Term
} from "./cli-term"
import type { CmdLine_Args, CmdLine_sArg } from "./types"

export interface CmdLine_Options {
    joiner: CmdLine_sTermJoiner
}

@displayers({
    simple: s => s.string
})
class CmdLine_Object {
    constructor(
        readonly executable: string,
        private readonly _terms: CmdLine_Term[],
        private readonly _options: CmdLine_Options
    ) {}

    private _withArgs(f: (args: CmdLine_Term[]) => CmdLine_Term[]) {
        return new CmdLine_Object(this.executable, f(this._terms), this._options)
    }

    private _withOptions(f: (options: CmdLine_Options) => CmdLine_Options) {
        return new CmdLine_Object(this.executable, this._terms, f(this._options))
    }

    flag(...flags: CmdLine_sArg[]) {
        const flagTerms = flags.map(flag => new CmdLine_Term_Flag(flag))
        return this._withArgs(terms => terms.concat(flagTerms))
    }

    verbatim(...values: string[]) {
        const verbatimTerms = values.map(value => new CmdLine_Term_Verbatim(value))
        return this._withArgs(terms => terms.concat(verbatimTerms))
    }

    option(args: CmdLine_Args) {
        const map = new Map(Object.entries(args)) as Map<CmdLine_sArg, string>
        const optionTerms = seq(map)
            .map(([key, value]) => {
                let joiner: string | undefined
                const lastChar = key.at(-1)
                if (lastChar === "=") {
                    joiner = "="
                    key = key.slice(0, -1) as CmdLine_sArg
                } else if (lastChar === " ") {
                    joiner = " "
                    key = key.slice(0, -1) as CmdLine_sArg
                }
                return new CmdLine_Term_Value(key, joiner, value)
            })
            .toArray()
            .pull()
        return this._withArgs(terms => terms.concat(optionTerms))
    }

    joiner(joiner: CmdLine_sTermJoiner) {
        return this._withOptions(options => merge({}, options, { joiner: joiner }))
    }

    toArray() {
        const terms = seq(this._terms)
            .filter(x => !x.isMissing)
            .flatMap(term => {
                return term.arr(this._options.joiner)
            })
            .toArray()
            .pull()
        if (this.executable !== "") {
            terms.unshift(this.executable)
        }
        return terms
    }

    get string() {
        return this.toArray().join(" ")
    }
}

const defaultOptions: CmdLine_Options = {
    joiner: " "
}
export type CmdLine = CmdLine_Object
export function CmdLine(executable: string, options?: Partial<CmdLine_Options>) {
    options = defaultsDeep({}, options, defaultOptions)
    return new CmdLine_Object(executable, [], options as any)
}
