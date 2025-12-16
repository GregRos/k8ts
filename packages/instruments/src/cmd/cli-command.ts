import { seq } from "doddle"
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
        private readonly _terms: CliTerm[],
        private readonly _options: CliCommandBuilderOptions
    ) {}

    private _withArgs(f: (args: CliTerm[]) => CliTerm[]) {
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
        const map = new Map(Object.entries(args)) as Map<CliKey, string>
        const optionTerms = seq(map)
            .map(([key, value]) => {
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
            .toArray()
            .pull()
        return this._withArgs(terms => terms.concat(optionTerms))
    }

    joiner(joiner: ValueTermJoiner) {
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

    static make(executable: string, options: CliCommandBuilderOptions) {
        return new CmdBuilder(executable, [], options)
    }
}

const defaultOptions: CliCommandBuilderOptions = {
    joiner: " "
}

export function Cmd(executable: string, options?: Partial<CliCommandBuilderOptions>) {
    options = defaultsDeep({}, options, defaultOptions)
    return CmdBuilder.make(executable, options as any)
}
