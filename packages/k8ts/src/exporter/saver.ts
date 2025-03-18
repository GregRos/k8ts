import type { Origin } from "@k8ts/instruments"
import Emittery from "emittery"
import { mkdir, rm, writeFile } from "fs/promises"
import { join } from "path"

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
        await rm(this._options.outdir, {
            force: true,
            maxRetries: 2,
            retryDelay: 500,
            recursive: true
        })
        await mkdir(this._options.outdir, { recursive: true })
    }

    async save(origin: Origin, manifests: string[]) {
        const content = this._splat(manifests)
        const filename = `${origin.name}`
        const encoded = this._encoder.encode(content)
        const e: SavingManifestEvent = {
            filename,
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
