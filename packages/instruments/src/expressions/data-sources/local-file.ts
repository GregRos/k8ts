import { doddlify } from "doddle"
import Path from "pathlib-js"
import StackTracey from "stacktracey"
import { display } from "../../utils/mixin/display"
import type { DataSource_sFormatName, DataSource_Shape } from "./interface"

/** Union type of allowed data source value types. */
export type DataSource_Allowed = string | Uint8Array

/**
 * Represents a local file path that can be read as text or binary data. Can be used instead of a
 * primitive in some cases when building Kubernetes manifests.
 */
export interface DataSource_FromLocalFile {
    /**
     * Creates a lazy data source that reads the file as text.
     *
     * @param mode - Must be "text"
     * @param encoding - Optional text encoding (default: "utf-8")
     * @returns Lazy data source for text content
     */
    as(mode: "text", encoding?: BufferEncoding): DataSource_Shape<string>

    /**
     * Creates a lazy data source that reads the file as binary data.
     *
     * @param mode - Must be "binary"
     * @returns Lazy data source for binary content
     */
    as(mode: "binary"): DataSource_Shape<Uint8Array>
}

@display({
    simple(self) {
        return `LocalFile(${self.path})`
    }
})
class _DataSource_LocalFile_Path implements DataSource_FromLocalFile {
    readonly path: Path

    constructor(
        private readonly _cwd: Path,
        relPath: string
    ) {
        this.path = this._cwd.join(relPath)
    }

    as(mode: DataSource_sFormatName, encoding?: BufferEncoding): DataSource_Shape {
        if (mode === "text") {
            return new _DataSource_LocalFile_Text(this, encoding)
        } else {
            return new _DataSource_LocalFile_Binary(this)
        }
    }
}

@display({
    simple(self) {
        return `LocalFileText(${self._parent.path}, ${self.encoding})`
    }
})
class _DataSource_LocalFile_Text implements DataSource_Shape<string> {
    constructor(
        private readonly _parent: _DataSource_LocalFile_Path,
        readonly encoding: BufferEncoding = "utf-8"
    ) {}

    @doddlify
    pull() {
        return this._parent.path.readFile(this.encoding)
    }
}

@display({
    simple(self) {
        return `LocalFileBinary(${self._parent.path})`
    }
})
class _DataSource_LocalFile_Binary implements DataSource_Shape<Uint8Array> {
    constructor(private readonly _parent: _DataSource_LocalFile_Path) {}

    @doddlify
    pull() {
        return this._parent.path.readFile().then(buf => new Uint8Array(buf))
    }
}

/**
 * Creates a file path reference relative to the caller's file location. You must call
 * `.as("string")` or `.as("binary")` on the returned object to get a data source.
 */
export function LocalFile(path: string) {
    const trace = new StackTracey().slice(1)
    const callerFile = trace.at(0).file
    return new _DataSource_LocalFile_Path(
        new Path(callerFile).parent(),
        path
    ) as DataSource_FromLocalFile
}
