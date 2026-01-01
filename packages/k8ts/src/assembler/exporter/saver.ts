import type { OriginNode } from "@k8ts/instruments"
import Emittery from "emittery"
import { glob, mkdir, rm, writeFile } from "fs/promises"
import { join, resolve } from "path"
export class ManifestSaver extends Emittery<ManifestSaverEventsTable> {
    private _encoder = new TextEncoder()
    constructor(private readonly _options: ManifestSaverOptions) {
        super()
    }

    _splat(manifests: string[]) {
        return manifests.join("\n---\n")
    }

    async prepareOnce() {
        await this.emit("purge", {
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

    async save(origin: OriginNode, manifests: string[]) {
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

        await this.emit("save", e)
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
}
