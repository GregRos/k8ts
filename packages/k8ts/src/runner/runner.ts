import { Assembler, AssemblerOptions, ProgressOptions, ProgressShower } from "../exporter"
import { File } from "../file"

export interface RunnerOptions extends AssemblerOptions {
    progress: ProgressOptions
}

export class Runner {
    constructor(private readonly _options: RunnerOptions) {}

    async run(input: Iterable<File.Input>) {
        const progressShower = new ProgressShower(this._options.progress)
        const assembler = new Assembler(this._options)
        const visualizer = progressShower.visualize(assembler)

        const result = await assembler.assemble(input)

        for (const { report, filename } of result) {
            console.log(`${filename}\n${report}`)
        }
        await visualizer
    }
}
