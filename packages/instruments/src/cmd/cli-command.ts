import { List, Map } from "immutable"
import { defaultsDeep, merge } from "lodash"
import { displayers } from "../displayers"
import {
    CliFlag,
    CliOptionValue,
    VerbatimTerm,
    type CliTerm,
    type ValueTermJoiner
} from "./cli-term"
import type { CliArgsMapping, CliKey } from "./types"

export interface CliCommandBuilderOptions {
    joiner: ValueTermJoiner
}

@displayers({
    simple: s => s.string
})
export class CmdBuilder {
    protected constructor(
        readonly executable: string,
        private readonly _terms: List<CliTerm>,
        private readonly _options: CliCommandBuilderOptions
    ) {}

    private _withArgs(f: (args: List<CliTerm>) => List<CliTerm>) {
        return new CmdBuilder(this.executable, f(this._terms), this._options)
    }

    private _withOptions(f: (options: CliCommandBuilderOptions) => CliCommandBuilderOptions) {
        return new CmdBuilder(this.executable, this._terms, f(this._options))
    }

    flag(...flags: CliKey[]) {
        const flagTerms = flags.map(flag => new CliFlag(flag))
        return this._withArgs(terms => terms.concat(flagTerms))
    }

    verbatim(...values: string[]) {
        const verbatimTerms = values.map(value => new VerbatimTerm(value))
        return this._withArgs(terms => terms.concat(verbatimTerms))
    }

    option(args: CliArgsMapping) {
        const map = Map(args)
        const optionTerms = map.entrySeq().map(([key, value]) => {
            let joiner: string | undefined
            const lastChar = key.at(-1)
            if (lastChar === "=") {
                joiner = "="
                key = key.slice(0, -1) as CliKey
            } else if (lastChar === " ") {
                joiner = " "
                key = key.slice(0, -1) as CliKey
            }
            return new CliOptionValue(key, joiner, value)
        })
        return this._withArgs(terms => terms.concat(optionTerms))
    }

    joiner(joiner: ValueTermJoiner) {
        return this._withOptions(options => merge({}, options, { joiner: joiner }))
    }

    toArray() {
        const terms = this._terms
            .filter(x => !x.isMissing)
            .map(term => term.str(this._options.joiner))
            .toArray()
        if (this.executable !== "") {
            terms.unshift(this.executable)
        }
        return terms
    }

    get string() {
        return this.toArray().join(" ")
    }

    static make(executable: string, options: CliCommandBuilderOptions) {
        return new CmdBuilder(executable, List(), options)
    }
}

const defaultOptions: CliCommandBuilderOptions = {
    joiner: " "
}

export function Cmd(executable: string, options?: Partial<CliCommandBuilderOptions>) {
    options = defaultsDeep({}, options, defaultOptions)
    return CmdBuilder.make(executable, options as any)
}
