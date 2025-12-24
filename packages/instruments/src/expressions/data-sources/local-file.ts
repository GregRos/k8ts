import Path from "pathlib-js"
import StackTracey from "stacktracey"
import type { TypedArray } from "what-are-you"
import { DataSource_Lazy } from "./base"
export type DataSource_Allowed = string | Uint8Array | TypedArray
export class DataSource_LocalFile_Path {
    readonly path: Path
    constructor(
        private readonly _cwd: Path,
        relPath: string
    ) {
        this.path = this._cwd.join(relPath)
    }

    as(mode: "text", encoding?: BufferEncoding): DataSource_Lazy<string>
    as(mode: "binary"): DataSource_Lazy<Uint8Array>
    as(mode: "text" | "binary", encoding?: BufferEncoding): DataSource_Lazy {
        if (mode === "text") {
            return new DataSource_LocalFile_Text(this, encoding)
        } else {
            return new DataSource_LocalFile_Binary(this)
        }
    }
}
class DataSource_LocalFile_Text extends DataSource_Lazy<string> {
    constructor(
        private readonly _parent: DataSource_LocalFile_Path,
        readonly encoding: BufferEncoding = "utf-8"
    ) {
        super(async () => {
            return this._parent.path.readFile(this.encoding)
        })
    }
}

class DataSource_LocalFile_Binary extends DataSource_Lazy<Uint8Array> {
    constructor(private readonly _parent: DataSource_LocalFile_Path) {
        super(async () => {
            const x = await this._parent.path.readFile()
            return new Uint8Array(x)
        })
    }
}

export function localRefFile(path: string) {
    const trace = new StackTracey().slice(1)
    const callerFile = trace.at(0).file
    return new DataSource_LocalFile_Path(new Path(callerFile).parent(), path)
}
