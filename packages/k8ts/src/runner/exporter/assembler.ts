import { Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { aseq } from "doddle"
import Emittery from "emittery"
import { cloneDeep } from "lodash"
import type { File } from "../../file"
import { ResourceLoader, type ResourceLoaderEventsTable } from "./loader"
import { Manifester, NodeManifest, type ManifesterEventsTable } from "./manifester"
import { ManifestSaver, type ManifestSaverEventsTable } from "./saver"
import { YamlSerializer, type YamlSerializerEventsTable } from "./serializer"
import { NodeGraphValidator, ValidatorEventsTable } from "./validator"

export class Assembler extends Emittery<AssemblerEventsTable> {
    constructor(private readonly _options: AssemblerOptions) {
        super()
    }

    async assemble(inFiles: Iterable<File.Input>) {
        const _emit = async <Name extends keyof AssemblerEventsTable>(
            event: Name,
            payload: AssemblerEventsTable[Name]
        ) => {
            return await this.emit(event, payload)
        }
        const validator = new NodeGraphValidator({})
        const loader = new ResourceLoader({})
        loader.onAny(_emit)
        const generator = new Manifester({
            cwd: this._options.cwd
        })
        generator.onAny(_emit)
        const serializer = new YamlSerializer({})
        serializer.onAny(_emit)
        const saver = new ManifestSaver({
            outdir: this._options.outdir
        })
        saver.onAny(_emit)
        const reports = aseq(inFiles)
            .before(async () => {
                await _emit("stage", { stage: "gathering" })
            })
            .each(async file => {
                await _emit("received-file", { file: file.__node__ })
            })
            .after(async () => {
                await _emit("stage", { stage: "loading" })
            })
            .collect()
            .map(async file => {
                const loaded = await loader.load(file)
                loaded.forEach(r => r.meta!.add(this._options.meta))
                return {
                    file: file.__entity__,
                    resources: loaded.filter(x => !x.isExternal)
                }
            })
            .after(async () => {
                await _emit("stage", { stage: "manifesting" })
            })
            .collect()
            .map(async ({ file, resources }) => {
                const manifests = await aseq(resources)
                    .map(async resource => {
                        return await generator.generate(resource)
                    })
                    .toArray()
                    .pull()

                return {
                    file: file.node,
                    resources: manifests
                } satisfies FileNodes
            })
            .after(async () => {
                await _emit("stage", { stage: "validating" })
            })
            .collect("array")
            .concatMap(async x => {
                validator.validate(x)
                return x
            })
            .after(async () => {
                await _emit("stage", { stage: "serializing" })
            })
            .map(async ({ file, resources }) => {
                const artifacts = await aseq(resources)
                    .map(async obj => {
                        return {
                            ...obj,
                            yaml: await serializer.serialize(obj.manifest)
                        }
                    })
                    .toArray()
                    .pull()

                return {
                    file,
                    artifacts
                }
            })
            .after(async () => {
                await _emit("stage", { stage: "saving" })
            })
            .after(async () => {
                await saver.prepareOnce()
            })
            .collect()
            .map(async ({ file, artifacts }) => {
                const { filename, bytes, path } = await saver.save(
                    file,
                    artifacts.map(x => x.yaml)
                )
                return {
                    file: file,
                    path,
                    filename,
                    bytes,
                    artifacts
                }
            })
            .after(async () => {
                await _emit("stage", { stage: "done" })
            })
            .collect()
            .toArray()
        const files = (await reports.pull()) satisfies AssembledFile[]
        return {
            files,
            options: cloneDeep(this._options)
        } as AssembledResult
    }
}
export interface FileNodes {
    file: Origin
    resources: NodeManifest[]
}
export interface Artifact extends NodeManifest {
    yaml: string
}
export interface AssembledFile {
    file: Origin
    path: string
    filename: string
    bytes: number
    artifacts: Artifact[]
}
export interface AssembledResult {
    files: AssembledFile[]
    options: AssemblerOptions
}
export interface AssemblerOptions {
    cwd?: string
    printOptions?: boolean
    outdir: string
    meta?: Omit<Meta.Input, "name" | "namespace"> | Meta
}
export type AssemblyStage =
    | "loading"
    | "validating"
    | "manifesting"
    | "serializing"
    | "saving"
    | "start"
    | "reporting"
    | "done"
    | "gathering"
export interface AssemblerEventsTable
    extends ManifestSaverEventsTable,
        YamlSerializerEventsTable,
        ManifesterEventsTable,
        ResourceLoaderEventsTable,
        ValidatorEventsTable {
    ["received-file"]: { file: Origin }
    ["stage"]: { stage: AssemblyStage }
}
export type AnyAssemblerEvent = {
    [K in keyof AssemblerEventsTable]: AssemblerEventsTable[K] & {
        type: K
    }
}[keyof AssemblerEventsTable]
