import Emittery from "emittery"
import { mkdir, rm, writeFile } from "fs/promises"
import { join } from "path"

export class ManifestSaver extends Emittery<ManifestSaverEvents> {
    constructor(private readonly _options: ManifestSaverOptions) {
        super()
    }

    _splat(manifests: string[]) {
        return manifests.join("\n---\n")
    }

    async clean() {
        await this.emit("cleaning", {
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

    async save(name: string, manifests: string[]) {
        const content = this._splat(manifests)
        const filename = `${name}.${this._options.extension}`
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
export interface CleaningOutDirEvent {
    outdir: string
}
export interface ManifestSaverEvents {
    saving: SavingManifestEvent
    cleaning: CleaningOutDirEvent
}

export interface ManifestSaverOptions {
    outdir: string
    extension: string
}
