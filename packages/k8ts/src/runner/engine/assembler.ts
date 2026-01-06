import { OriginNode, type OriginExporter, type ResourceNode } from "@k8ts/instruments"
import { Metadata, type Metadata_Input } from "@k8ts/metadata"
import { aseq } from "doddle"
import EventEmitter from "eventemitter3"
import { cloneDeep } from "lodash"
import { version } from "../../version"
import { Engine_ResourceLoader, type AssemblerRscLoaderEvents } from "./loader"
import { Engine_Manifester, NodeManifest, type ManifesterEventsTable } from "./manifester"
import { Engine_Saver, type ManifestSaverEventsTable } from "./saver"
import { Engine_Serializer_Yaml, type SerializerEventsTable } from "./serializer"

export const assemblerEventNames = (() => {
    const rec: Record<keyof AssemblerEventsTable, true> = {
        purge: true,
        stage: true,
        load: true,
        manifest: true,
        serialize: true,
        save: true
    }
    return Object.keys(rec) as (keyof AssemblerEventsTable)[]
})()
export class Assembler {
    private _emitter: EventEmitter<AssemblerEventsTable> = new EventEmitter()
    constructor(private readonly _options: AssemblerOptions) {}

    on<Name extends keyof AssemblerEventsTable>(
        event: Name,
        listener: (payload: AssemblerEventsTable[Name]) => void
    ) {
        this._emitter.on(event, listener as any)
        return this
    }

    onAny(
        handler: <Name extends keyof AssemblerEventsTable>(
            name: Name,
            payload: AssemblerEventsTable[Name]
        ) => void
    ) {
        for (const eventName of assemblerEventNames) {
            this._emitter.on(eventName, (payload: unknown) => {
                handler(eventName, payload as any)
            })
        }
        return this
    }
    private _attachProductionAnnotations(resource: ResourceNode) {
        const loc = resource.trace.format({
            cwd: this._options.cwd
        })
        resource.meta!.add(`build.k8ts.org/`, {
            "^constructed-at": loc,
            "^produced-by": `k8ts@${version}`
        })
    }
    async assemble(inFiles: Iterable<OriginExporter>) {
        const emitter = this._emitter
        const loader = new Engine_ResourceLoader({
            emitter
        })
        emitter.on("load", ({ resource }) => {
            this._attachProductionAnnotations(resource)
        })
        const generator = new Engine_Manifester({
            cwd: this._options.cwd,
            emitter
        })
        const serializer = new Engine_Serializer_Yaml({ emitter })
        const saver = new Engine_Saver({
            outdir: this._options.outdir,
            emitter
        })
        const reports = aseq(inFiles)
            .map(x => x.node)
            .before(async () => {
                emitter.emit("stage", { stage: "gathering" })
            })

            .after(async () => {
                emitter.emit("stage", { stage: "loading" })
            })
            .collect()
            .map(async file => {
                const loaded = await loader.load(file)
                loaded.forEach(r => r.meta!.add(this._options.meta))
                return {
                    file: file,
                    resources: loaded.filter(x => !x.noEmit)
                }
            })
            .after(async () => {
                emitter.emit("stage", { stage: "manifesting" })
            })
            .collect()
            .map(async ({ file, resources }) => {
                const manifests = await aseq(resources)
                    .filter(x => !x.noEmit)
                    .map(async resource => {
                        return await generator.generate(resource)
                    })
                    .toArray()
                    .pull()

                return {
                    file: file,
                    resources: manifests
                } satisfies FileNodes
            })

            .after(async () => {
                emitter.emit("stage", { stage: "serializing" })
            })
            .collect()
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
                emitter.emit("stage", { stage: "saving" })
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
                emitter.emit("stage", { stage: "done" })
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
    file: OriginNode
    resources: NodeManifest[]
}
export interface Artifact extends NodeManifest {
    yaml: string
}
export interface AssembledFile {
    file: OriginNode
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
    meta?: Omit<Metadata_Input, "name" | "namespace"> | Metadata
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
        SerializerEventsTable,
        ManifesterEventsTable,
        AssemblerRscLoaderEvents {
    ["stage"]: { stage: AssemblyStage }
}
export type AnyAssemblerEvent = {
    [K in keyof AssemblerEventsTable]: AssemblerEventsTable[K] & {
        type: K
    }
}[keyof AssemblerEventsTable]
