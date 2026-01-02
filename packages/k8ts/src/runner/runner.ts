import { ForwardExports, Trace_GitCommit, Trace_SourceCode } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { seq } from "doddle"
import StackTracey from "stacktracey"
import { Assembler, AssemblerOptions, ProgressOptions, ProgressShower } from "../assembler"
import { Summarizer } from "./summarizer"

export interface RunnerOptions extends AssemblerOptions {
    cwd?: string
    printOptions?: boolean
    progress: ProgressOptions
}

export class Runner {
    constructor(private readonly _options: RunnerOptions) {}

    async run<Ts extends ForwardExports[]>(input: Ts) {
        const results = seq(input)
            .map(e => e.__entity__())
            .toArray()
            .pull()
        const gitInfo = await Trace_GitCommit.make({
            cwd: this._options.cwd
        })

        const runTrace = new Trace_SourceCode(new StackTracey().slice(1))
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
        const summarizer = new Summarizer({
            printOptions: this._options.printOptions
        })
        const visualizer = progressShower.visualize(assembler)
        const result = await assembler.assemble(results)

        const viz = summarizer.result(result)

        await visualizer
        console.log()
        console.log(viz)
    }
}
