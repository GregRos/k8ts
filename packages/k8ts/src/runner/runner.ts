import { GitTrace, Trace, type Rsc_FwRef_Exports } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import Emittery from "emittery"
import StackTracey from "stacktracey"
import {
    Assembler,
    AssemblerEventsTable,
    AssemblerOptions,
    ProgressOptions,
    ProgressShower
} from "./exporter"
import { proverbsPath } from "./paths"
import { Proverbs } from "./silly/proverbs"
import { Summarizer } from "./summarizer"

export interface RunnerOptions extends AssemblerOptions {
    cwd?: string
    printOptions?: boolean
    progress: ProgressOptions
}

export class Runner extends Emittery<AssemblerEventsTable> {
    constructor(private readonly _options: RunnerOptions) {
        super()
    }

    async run<Ts extends Rsc_FwRef_Exports[]>(input: Ts) {
        const results = seq(input)
            .map(e => e.__entity__())
            .toArray()
            .pull()
        const gitInfo = await GitTrace.make({
            cwd: this._options.cwd
        })

        const runTrace = new Trace(new StackTracey().slice(1))
        const options = {
            cwd: ".",
            ...this._options,
            meta: Meta.make(this._options.meta)
                .add(`source.k8ts.org/`, {
                    "^emitted-at": runTrace.format({
                        cwd: this._options.cwd
                    })
                })
                .add(gitInfo?.metaFields)
        }

        const progressShower = new ProgressShower(options.progress)
        const assembler = new Assembler(options)
        assembler.onAny(async (name, data) => {
            await this.emit(name, data)
        })
        const summarizer = new Summarizer({
            printOptions: this._options.printOptions
        })
        const visualizer = progressShower.visualize(assembler)
        const result = await assembler.assemble(results)

        const viz = summarizer.result(result)

        await visualizer
        console.log()
        console.log(viz)
        try {
            const proverbs = await Proverbs.make(proverbsPath)
            console.log(chalk.italic.magentaBright(proverbs.random))
        } catch {}
    }
}
