import { dump } from "js-yaml"
import { cloneDeep, cloneDeepWith } from "lodash"
import { MakeError } from "../error"
import type { File } from "../file"
import type { Base } from "../node"
export namespace Emitter {
    export interface Props {
        outdir: string
        extension: string
    }

    export class Emitter {
        constructor(private _props: Props) {}

        private _cleanManifest(manifest: Record<string, any>) {
            const _cleanKeys = (obj: any) => {
                if (typeof obj !== "object") {
                    return obj
                }
                for (const [k, v] of Object.entries(manifest)) {
                    if (v === undefined) {
                        delete manifest[k]
                    }
                    if (v == null) {
                        throw new MakeError(`Null value found in manifest: ${k}`)
                    }
                }
                return undefined
            }
            const clone = cloneDeep(manifest)
            return cloneDeepWith(clone, _cleanKeys)
        }

        private _toObject(resource: Base) {
            const manifest = resource.manifest()
            return this._cleanManifest(manifest)
        }

        private _dumpManifest(resource: Base) {
            const obj = this._toObject(resource)
            return dump(obj, {
                noRefs: true,
                indent: 2,
                quotingType: '"',
                noArrayIndent: true
            })
        }
        private _emitFile(file: File) {}
    }
}
