import { BaseManifest, Origin, ResourceNode } from "@k8ts/instruments"
import { aseq } from "doddle"
import Emittery from "emittery"
import { cloneDeep } from "lodash"
import type { File } from "../../file"
import { ResourceLoader, type ResourceLoaderEventsTable } from "./loader"
import { Manifester, type ManifesterEventsTable } from "./manifester"
import { ManifestSaver, type ManifestSaverEventsTable, type ManifestSaverOptions } from "./saver"
import { YamlSerializer, type YamlSerializerEventsTable } from "./serializer"

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
        const loader = new ResourceLoader({})
        loader.onAny(_emit)
        const generator = new Manifester({})
        generator.onAny(_emit)
        const serializer = new YamlSerializer({})
        serializer.onAny(_emit)
        const saver = new ManifestSaver(this._options.saver)
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
                        return {
                            k8ts: resource,
                            manifest: await generator.generate(resource)
                        }
                    })
                    .toArray()
                    .pull()

                return {
                    file,
                    manifests
                }
            })
            .after(async () => {
                await _emit("stage", { stage: "serializing" })
            })
            .collect()
            .map(async ({ file, manifests }) => {
                const artifacts = await aseq(manifests)
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
                    file.node,
                    artifacts.map(x => x.yaml)
                )
                return {
                    file: file.node,
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
export interface Artifact {
    k8ts: ResourceNode
    manifest: BaseManifest
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
    saver: ManifestSaverOptions
}
export type AssemblyStage =
    | "loading"
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
        ResourceLoaderEventsTable {
    ["received-file"]: { file: Origin }
    ["stage"]: { stage: AssemblyStage }
}
export type AnyAssemblerEvent = {
    [K in keyof AssemblerEventsTable]: AssemblerEventsTable[K] & {
        type: K
    }
}[keyof AssemblerEventsTable]
