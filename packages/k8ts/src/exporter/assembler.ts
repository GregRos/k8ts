import { aseq } from "doddle"
import Emittery from "emittery"
import { rm } from "fs/promises"
import type { File } from "../file"
import { ManifestGenerator, type ManifestGeneratorEvents } from "./generator"
import { ResourceLoader, type ResourceLoaderEvents } from "./loader"
import { Reporter } from "./reporter"
import { ManifestSaver, type ManifestSaverEvents, type ManifestSaverOptions } from "./saver"
import { YamlSerializer, type YamlSerializerEvents } from "./serializer"
export interface AssemblerOptions {
    saver: ManifestSaverOptions
    holdTime: number
}

export interface AssemblerEvents
    extends ManifestSaverEvents,
        YamlSerializerEvents,
        ResourceLoaderEvents,
        ManifestGeneratorEvents {
    receivedFile: { file: File }
}

export class Assembler extends Emittery<AssemblerEvents> {
    constructor(private readonly _options: AssemblerOptions) {}

    async assemble(inFiles: Iterable<File>) {
        const files = [] as File[]
        const loader = new ResourceLoader({})

        const generator = new ManifestGenerator({})
        const serializer = new YamlSerializer({})
        const saver = new ManifestSaver(this._options.saver)
        const reporter = new Reporter({})

        const hmm = await aseq(inFiles)
            .map(async file => {
                const resources = await aseq(() => loader.load(file))
                    .map(async resource => {
                        return generator.generate(resource)
                    })
                    .map(async manifest => {
                        return serializer.serialize(manifest)
                    })
                    .toArray()
                    .pull()

                return {
                    file,
                    resources
                }
            })
            .toArray()
            .map(async arr => {
                await rm(this._options.saver.outdir, {})
            })

        async function assembleFile(file: File) {
            const origin = file.__origin__
            const collator = new ResourceLoader({})
            const allResources = await collator.load(file)
            const manifests = await aseq(allResources).map(generator.generate).toArray().pull()
            const yamlified = serializer.exportAll(manifests)
            await saver.save(origin.name, yamlified)
        }
    }
}
