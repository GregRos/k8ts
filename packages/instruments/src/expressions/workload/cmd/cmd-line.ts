import { seq } from "doddle"
import { merge } from "lodash"
import { display } from "../../../utils/mixin/display"
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
export interface Cmd {
    flag(...flags: CmdLine_sArg[]): Cmd
    verbatim(...values: string[]): Cmd
    options(args: CmdLine_Args): Cmd
    joiner(joiner: CmdLine_sTermJoiner): Cmd
    toArray(): string[]
    toString(): string
}

const defaultOptions: CmdLine_Options = {
    joiner: " "
}
export function Cmd(executable: string) {
    return new _CmdLine(executable, [], {
        joiner: " "
    }) as Cmd
}

@display({
    simple: s => s.toString()
})
class _CmdLine implements Cmd {
    constructor(
        readonly executable: string,
        private readonly _terms: CmdLine_Term[],
        private readonly _options: CmdLine_Options
    ) {}

    private _withArgs(f: (args: CmdLine_Term[]) => CmdLine_Term[]) {
        return new _CmdLine(this.executable, f(this._terms), this._options)
    }

    private _withOptions(f: (options: CmdLine_Options) => CmdLine_Options) {
        return new _CmdLine(this.executable, this._terms, f(this._options))
    }

    flag(...flags: CmdLine_sArg[]) {
        const flagTerms = flags.map(flag => new CmdLine_Term_Flag(flag))
        return this._withArgs(terms => terms.concat(flagTerms))
    }

    verbatim(...values: string[]) {
        const verbatimTerms = values.map(value => new CmdLine_Term_Verbatim(value))
        return this._withArgs(terms => terms.concat(verbatimTerms))
    }

    options(args: CmdLine_Args) {
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

    toString() {
        return this.toArray().join(" ")
    }
}
