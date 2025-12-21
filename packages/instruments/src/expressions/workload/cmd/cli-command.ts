import { seq } from "doddle"
import { defaultsDeep, merge } from "lodash"
import { displayers } from "../../../utils/displayers"
import {
    Cli_Flag,
    Cli_OptionValueTerm,
    Cli_VerbatimTerm,
    type Cli_sTermJoiner,
    type CliTerm
} from "./cli-term"
import type { Cli_Record_ArgMap, Cli_sFlag } from "./types"

export interface CliCommandBuilderOptions {
    joiner: Cli_sTermJoiner
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

    flag(...flags: Cli_sFlag[]) {
        const flagTerms = flags.map(flag => new Cli_Flag(flag))
        return this._withArgs(terms => terms.concat(flagTerms))
    }

    verbatim(...values: string[]) {
        const verbatimTerms = values.map(value => new Cli_VerbatimTerm(value))
        return this._withArgs(terms => terms.concat(verbatimTerms))
    }

    option(args: Cli_Record_ArgMap) {
        const map = new Map(Object.entries(args)) as Map<Cli_sFlag, string>
        const optionTerms = seq(map)
            .map(([key, value]) => {
                let joiner: string | undefined
                const lastChar = key.at(-1)
                if (lastChar === "=") {
                    joiner = "="
                    key = key.slice(0, -1) as Cli_sFlag
                } else if (lastChar === " ") {
                    joiner = " "
                    key = key.slice(0, -1) as Cli_sFlag
                }
                return new Cli_OptionValueTerm(key, joiner, value)
            })
            .toArray()
            .pull()
        return this._withArgs(terms => terms.concat(optionTerms))
    }

    joiner(joiner: Cli_sTermJoiner) {
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
