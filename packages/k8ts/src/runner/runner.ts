import { Trace } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import StackTracey from "stacktracey"
import { File } from "../file"
import { Assembler, AssemblerOptions, ProgressOptions, ProgressShower } from "./exporter"
import { k8ts_namespace } from "./exporter/meta"
import { Summarizer, SummarizerOptions } from "./summarizer"

export interface RunnerOptions extends AssemblerOptions {
    cwd?: string
    progress: ProgressOptions
    summarizer: SummarizerOptions
}

export class Runner {
    constructor(private readonly _options: RunnerOptions) {}

    async run(input: Iterable<File.Input>) {
        const runTrace = new Trace(new StackTracey().at(1))
        const options = {
            cwd: ".",
            ...this._options,
            meta: Meta.make(this._options.meta).add(k8ts_namespace, {
                "^emitted-at": runTrace.format({
                    cwd: this._options.cwd
                })
            })
        }
        const progressShower = new ProgressShower(options.progress)
        const assembler = new Assembler(options)
        const summarizer = new Summarizer(options.summarizer)
        const visualizer = progressShower.visualize(assembler)
        const result = await assembler.assemble(input)

        const viz = summarizer.result(result)

        await visualizer
        console.log()
        console.log(viz)
    }
}
