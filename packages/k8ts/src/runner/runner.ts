import { Set } from "immutable"
import {
    AssembledFile,
    Assembler,
    AssemblerOptions,
    ProgressOptions,
    ProgressShower
} from "../exporter"
import { File } from "../file"
import { ManifestResource } from "../node"
import { Summarizer, SummarizerOptions } from "./summarizer"

export interface RunnerOptions extends AssemblerOptions {
    progress: ProgressOptions
    summarizer: SummarizerOptions
    checkDanglingRefs: boolean
}

export class Runner {
    constructor(private readonly _options: RunnerOptions) {}

    private _computeDanglingObjects(result: AssembledFile[]) {
        const allObjects = Set(
            result.flatMap(x => [
                x.file,
                ...x.artifacts.flatMap(x => [x.k8ts, ...x.k8ts.getResourceSubtree()])
            ])
        )
        const rootOrigins = Set(result.map(x => x.file.root))
        const allConstructed = Set(rootOrigins.flatMap(x => x.getAttachedTree()))
        const diff = allConstructed.subtract(allObjects).filter(x => {
            if (x instanceof ManifestResource) {
                if (x.isExternal) {
                    return false
                }
            }
            return true
        })
        return diff
    }
    async run(input: Iterable<File.Input>) {
        const progressShower = new ProgressShower(this._options.progress)
        const assembler = new Assembler(this._options)
        const summarizer = new Summarizer(this._options.summarizer)
        const visualizer = progressShower.visualize(assembler)
        const result = await assembler.assemble(input)
        const dangling = this._options.checkDanglingRefs
            ? this._computeDanglingObjects(result)
            : undefined
        const viz = summarizer.files(
            result.map(x => ({
                filename: x.filename,
                resources: x.artifacts.map(x => x.k8ts)
            })),
            dangling?.toArray()
        )

        await visualizer
        console.log("\n", viz)
    }
}
