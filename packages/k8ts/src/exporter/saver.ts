import type { Origin } from "@k8ts/instruments"
import Emittery from "emittery"
import { mkdir, rm, writeFile } from "fs/promises"
import { join } from "path"

export class ManifestSaver extends Emittery<ManifestSaverEventsTable> {
    constructor(private readonly _options: ManifestSaverOptions) {
        super()
    }

    _splat(manifests: string[]) {
        return manifests.join("\n---\n")
    }

    async prepareOnce() {
        await this.emit("purging", {
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
        const filename = `${origin.name}.${this._options.extension}`
        await this.emit("saving", {
            filename,
            content: content
        })
        await mkdir(this._options.outdir, { recursive: true })
        await writeFile(join(this._options.outdir, filename), content)
    }
}
export interface SavingManifestEvent {
    filename: string
    content: string
}
export interface PurgingDirEvent {
    outdir: string
}
export interface ManifestSaverEventsTable {
    saving: SavingManifestEvent
    purging: PurgingDirEvent
}

export interface ManifestSaverOptions {
    outdir: string
    extension: string
}
