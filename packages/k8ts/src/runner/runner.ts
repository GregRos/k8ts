import { File } from "../file"
import { Assembler, AssemblerOptions, ProgressOptions, ProgressShower } from "./exporter"
import { Summarizer, SummarizerOptions } from "./summarizer"

export interface RunnerOptions extends AssemblerOptions {
    progress: ProgressOptions
    summarizer: SummarizerOptions
}

export class Runner {
    constructor(private readonly _options: RunnerOptions) {}

    async run(input: Iterable<File.Input>) {
        const progressShower = new ProgressShower(this._options.progress)
        const assembler = new Assembler(this._options)
        const summarizer = new Summarizer(this._options.summarizer)
        const visualizer = progressShower.visualize(assembler)
        const result = await assembler.assemble(input)

        const viz = summarizer.result(result)

        await visualizer
        console.log()
        console.log(viz)
    }
}
