import type { OriginVertex } from "@k8ts/instruments"
import type EventEmitter from "eventemitter3"
import { glob, mkdir, rm, writeFile } from "fs/promises"
import { join, resolve } from "path"
export class Engine_Saver {
    private _encoder = new TextEncoder()
    constructor(private readonly _options: ManifestSaverOptions) {}

    _splat(manifests: string[]) {
        return manifests.join("\n---\n")
    }

    async prepareOnce() {
        this._options.emitter?.emit("purge", {
            outdir: this._options.outdir
        })
        await mkdir(this._options.outdir, { recursive: true })

        for await (const file of glob(`${this._options.outdir}/**/*`)) {
            await rm(file, {
                force: true,
                maxRetries: 2,
                retryDelay: 500,
                recursive: true
            })
        }
    }

    async save(origin: OriginVertex, manifests: string[]) {
        const content = this._splat(manifests)
        const filename = `${origin.name}`
        const encoded = this._encoder.encode(content)
        const outPath = resolve(this._options.outdir, filename)
        const e: SavingManifestEvent = {
            filename,
            path: outPath,
            content: content,
            bytes: encoded.byteLength
        }

        this._options.emitter?.emit("save", e)
        await mkdir(this._options.outdir, { recursive: true })
        await writeFile(join(this._options.outdir, filename), encoded)
        return e
    }
}
export interface SavingManifestEvent {
    path: string
    filename: string
    content: string
    bytes: number
}
export interface PurgingDirEvent {
    outdir: string
}
export interface ManifestSaverEventsTable {
    save: SavingManifestEvent
    purge: PurgingDirEvent
}

export interface ManifestSaverOptions {
    outdir: string
    emitter?: EventEmitter<any>
}
