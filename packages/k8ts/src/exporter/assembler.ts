import { aseq, type ASeq, type DoddleAsync } from "doddle"
import Emittery from "emittery"
import type { File } from "../file"
import { ManifestGenerator, type ManifestGeneratorEventsTable } from "./generator"
import { ResourceLoader, type ResourceLoaderEventsTable } from "./loader"
import { Summarizer, SummarizerEventsTable } from "./reporter"
import { ManifestSaver, type ManifestSaverEventsTable, type ManifestSaverOptions } from "./saver"
import { YamlSerializer, type YamlSerializerEventsTable } from "./serializer"

export class Assembler extends Emittery<AssemblerEventsTable> {
    constructor(private readonly _options: AssemblerOptions) {
        super()
    }

    assemble(inFiles: Iterable<File.Input>) {
        const _emit = async <Name extends keyof AssemblerEventsTable>(
            event: Name,
            payload: AssemblerEventsTable[Name]
        ) => {
            return await this.emit(event, payload)
        }
        const loader = new ResourceLoader({})
        loader.onAny(_emit)
        const generator = new ManifestGenerator({})
        generator.onAny(_emit)
        const serializer = new YamlSerializer({})
        serializer.onAny(_emit)
        const saver = new ManifestSaver(this._options.saver)
        saver.onAny(_emit)
        const reporter = new Summarizer({})
        reporter.onAny(_emit)
        const reports = aseq(inFiles)
            .before(async () => {
                await _emit("stage", { stage: "gathering" })
            })
            .each(async file => {
                await _emit("received-file", { file })
            })
            .after(async () => {
                await _emit("stage", { stage: "loading" })
            })
            .collect()
            .map(async file => {
                const loaded = await loader.load(file)
                return {
                    file,
                    resources: loaded
                }
            })
            .after(async () => {
                await _emit("stage", { stage: "generating" })
            })
            .collect()
            .map(async ({ file, resources }) => {
                const manifests = await aseq(resources)
                    .filter(x => !x.isExternal)
                    .map(async resource => {
                        return generator.generate(resource)
                    })
                    .toArray()
                    .pull()

                return {
                    file,
                    resources,
                    manifests
                }
            })
            .after(async () => {
                await _emit("stage", { stage: "serializing" })
            })
            .collect()
            .map(async ({ file, manifests, resources }) => {
                const serialized = await aseq(manifests)
                    .map(async res => {
                        return serializer.serialize(res)
                    })
                    .toArray()
                    .pull()

                return {
                    file,
                    resources: resources,
                    serialized
                }
            })
            .after(async () => {
                await _emit("stage", { stage: "serializing" })
            })
            .after(async () => {
                await saver.prepareOnce()
            })
            .collect()
            .each(async ({ file, serialized }) => {
                await saver.prepareOnce()
                await saver.save(file.__origin__, serialized)
            })
            .after(async () => {
                await _emit("stage", { stage: "reporting" })
            })
            .collect()
            .map(async ({ file, resources }) => {
                return {
                    filename: file.__origin__.name,
                    report: reporter.resources(resources)
                }
            })
            .each(x => {
                console.log(x.report)
            })
            .after(async () => {
                await _emit("stage", { stage: "done" })
            })
            .toArray()
        return reports.pull()
    }
}
export interface AssemblerOptions {
    saver: ManifestSaverOptions
}
export type AssemblyStage =
    | "loading"
    | "generating"
    | "serializing"
    | "saving"
    | "reporting"
    | "done"
    | "gathering"
export interface AssemblerEventsTable
    extends ManifestSaverEventsTable,
        YamlSerializerEventsTable,
        ManifestGeneratorEventsTable,
        ResourceLoaderEventsTable,
        SummarizerEventsTable {
    ["received-file"]: { file: File.Input }
    ["stage"]: { stage: AssemblyStage }
}
export type AnyAssemblerEvent = {
    [K in keyof AssemblerEventsTable]: AssemblerEventsTable[K] & {
        type: K
    }
}[keyof AssemblerEventsTable]
export interface AssemblyResult {
    assembly: DoddleAsync<{
        filename: string
        report: string
    }>
    events: ASeq<AnyAssemblerEvent>
}
