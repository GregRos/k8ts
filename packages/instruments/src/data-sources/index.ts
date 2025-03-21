import { doddle, DoddleAsync } from "doddle"
import { readFile } from "fs/promises"
import { Map } from "immutable"
import { dirname, join, resolve } from "path"
import StackTracey from "stacktracey"
import { InstrumentsError } from "../error"
export type LocalFileMode = "text" | "binary"

export interface LocalFileSourceProps<Mode extends LocalFileMode = "text"> {
    pointOfCall: StackTracey
    path: string
    cwd?: string
    mode?: Mode
}
export class LocalFileSource<Mode extends LocalFileMode = "text"> {
    constructor(private readonly _props: LocalFileSourceProps<Mode>) {}

    get cwd() {
        if (this._props.cwd) {
            return this._props.cwd
        }
        const where = this._props.pointOfCall.at(0)
        return dirname(where.file)
    }

    get path() {
        const where = this._props.pointOfCall.at(0)
        const joined = join(dirname(where.file), this._props.path)
        return resolve(joined)
    }

    contents = doddle(async () => {
        const mode = this._props.mode ?? "text"
        if (mode === "binary") {
            const data = await readFile(this.path, null)
            return data
        }
        return readFile(this.path, "utf-8")
    }) as DoddleAsync<Mode extends "text" ? string : Uint8Array>
}

export function localFile<Mode extends LocalFileMode = "text">(
    path: string,
    props?: Pick<LocalFileSourceProps<Mode>, "cwd" | "mode">
): LocalFileSource<Mode>
export function localFile(args: TemplateStringsArray, ...params: any[]): LocalFileSource<"text">
export function localFile(args: any, ...params: any[]) {
    if (typeof args === "string") {
        const options = params[0] ?? {}
        return new LocalFileSource({
            pointOfCall: new StackTracey().slice(1),
            path: args,
            ...(options ?? {})
        })
    }
    const path = String.raw(args, ...params)
    return new LocalFileSource({
        pointOfCall: new StackTracey().slice(1),
        path
    })
}

export interface TypedArrayLike {
    buffer: ArrayBuffer
    byteLength: number
}
export type DataSource_Text = LocalFileSource<"text"> | string
export type DataSource_Binary = LocalFileSource<"binary"> | TypedArrayLike | ArrayBuffer
export type DataSourceRecord_Text = Record<string, DataSource_Text>
export type DataSourceRecord_Binary = Record<string, DataSource_Binary>
export type DataSourceRecord = DataSourceRecord_Text | DataSourceRecord_Binary
export function isTypedArray(data: DataSource_Binary): data is TypedArrayLike {
    return (
        typeof data === "object" &&
        "buffer" in data &&
        "byteSize" in data &&
        typeof data.byteSize === "number"
    )
}
export function isArrayBuffer(data: DataSource_Binary): data is ArrayBuffer {
    return data instanceof ArrayBuffer
}
export interface DataSourceResolvedRecord {
    data: Record<string, string>
    binaryData: Record<string, Uint8Array>
}
type MaybePromise<T> = T | Promise<T>
async function promiseAllMap<K, V>(m: Map<K, MaybePromise<V>>) {
    const promises = m.toArray().map(async x => [x[0], await x[1]] as [K, V])
    const res = await Promise.all(promises)
    return Map(res)
}
export async function resolveText(record: DataSourceRecord_Text) {
    const mp = Map(record).map(async (v, k) => {
        let resolved = v
        if (v instanceof LocalFileSource) {
            resolved = await v.contents.pull()
        }
        if (typeof resolved !== "string") {
            throw new InstrumentsError(
                `Got an invalid data value ${v} for key ${k}. Must be a string.`
            )
        }
        return resolved
    })
    return promiseAllMap(mp)
}
export async function resolveBinary(record: DataSourceRecord_Binary) {
    const mp = Map(record).map(async (v, k) => {
        let resolved = v
        if (v instanceof LocalFileSource) {
            resolved = await v.contents.pull()
        }
        if (isTypedArray(resolved)) {
            return new Uint8Array(resolved.buffer)
        } else if (isArrayBuffer(resolved)) {
            return new Uint8Array(resolved)
        } else {
            throw new InstrumentsError(
                `Got an invalid data value ${v} for key ${k}. Must be binary data.`
            )
        }
    })

    return promiseAllMap(mp)
}
