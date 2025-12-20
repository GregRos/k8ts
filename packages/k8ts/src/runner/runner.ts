import { GitTrace, Trace, type ChildOriginEntity } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import Emittery from "emittery"
import StackTracey from "stacktracey"
import { k8ts_namespace } from "../world/world"
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

    async run(input: Iterable<ChildOriginEntity>) {
        const gitInfo = await GitTrace.make({
            cwd: this._options.cwd
        })

        const runTrace = new Trace(new StackTracey().slice(1))
        const options = {
            cwd: ".",
            ...this._options,
            meta: Meta.make(this._options.meta)
                .add(k8ts_namespace, {
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
        const result = await assembler.assemble(input)

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
