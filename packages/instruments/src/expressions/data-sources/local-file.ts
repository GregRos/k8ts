import Path from "pathlib-js"
import StackTracey from "stacktracey"
import { DataSource_Lazy } from "./base"

/** Union type of allowed data source value types. */
export type DataSource_Allowed = string | Uint8Array

/**
 * Represents a local file path that can be read as text or binary data. Can be used instead of a
 * primitive in some cases when building Kubernetes manifests.
 */
class DataSource_LocalFile_Path {
    readonly path: Path

    /**
     * Creates a local file path data source.
     *
     * @param _cwd - The current working directory
     * @param relPath - Relative path to the file
     */
    constructor(
        private readonly _cwd: Path,
        relPath: string
    ) {
        this.path = this._cwd.join(relPath)
    }

    /**
     * Creates a lazy data source that reads the file as text.
     *
     * @param mode - Must be "text"
     * @param encoding - Optional text encoding (default: "utf-8")
     * @returns Lazy data source for text content
     */
    as(mode: "text", encoding?: BufferEncoding): DataSource_Lazy<string>

    /**
     * Creates a lazy data source that reads the file as binary data.
     *
     * @param mode - Must be "binary"
     * @returns Lazy data source for binary content
     */
    as(mode: "binary"): DataSource_Lazy<Uint8Array>

    as(mode: "text" | "binary", encoding?: BufferEncoding): DataSource_Lazy {
        if (mode === "text") {
            return new DataSource_LocalFile_Text(this, encoding)
        } else {
            return new DataSource_LocalFile_Binary(this)
        }
    }
}

/** Data source for reading local files as text with specified encoding. */
class DataSource_LocalFile_Text extends DataSource_Lazy<string> {
    /**
     * Creates a text file data source.
     *
     * @param _parent - Parent path object
     * @param encoding - Text encoding (default: "utf-8")
     */
    constructor(
        private readonly _parent: DataSource_LocalFile_Path,
        readonly encoding: BufferEncoding = "utf-8"
    ) {
        super(async () => {
            return this._parent.path.readFile(this.encoding)
        })
    }
}

/** Data source for reading local files as binary (Uint8Array). */
class DataSource_LocalFile_Binary extends DataSource_Lazy<Uint8Array> {
    /**
     * Creates a binary file data source.
     *
     * @param _parent - Parent path object
     */
    constructor(private readonly _parent: DataSource_LocalFile_Path) {
        super(async () => {
            const x = await this._parent.path.readFile()
            return new Uint8Array(x)
        })
    }
}

/**
 * Creates a file path reference relative to the caller's file location. You must call `.as("text")`
 * or `.as("binary")` on the returned object to get a data source.
 *
 * Can be used instead of a primitive in some cases when building Kubernetes manifests.
 *
 * @example
 *     // In /project/src/config.ts:
 *     const data = localRefFile("../data/config.json").as("text")
 *     const content = await data.get() // Reads /project/data/config.json
 *
 * @param path - Relative path to the file from the caller's directory
 * @returns File path object that can be read as text or binary
 */
export function localRefFile(path: string) {
    const trace = new StackTracey().slice(1)
    const callerFile = trace.at(0).file
    return new DataSource_LocalFile_Path(new Path(callerFile).parent(), path)
}
