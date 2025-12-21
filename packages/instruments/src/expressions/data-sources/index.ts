import { doddle, DoddleAsync, seq, type Doddle } from "doddle"
import { readFile } from "fs/promises"
import { dirname, join, resolve } from "path"
import StackTracey from "stacktracey"
import { InstrumentsError } from "../../error"
export type DataSource_LocalFile_Mode = "text" | "binary"

export interface DataSource_LocalFile_Props<Mode extends DataSource_LocalFile_Mode = "text"> {
    pointOfCall: StackTracey
    path: string
    cwd?: string
    mode?: Mode
}
export class DataSource_LocalFile<Mode extends DataSource_LocalFile_Mode = "text"> {
    constructor(private readonly _props: DataSource_LocalFile_Props<Mode>) {}

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

export function localFile<Mode extends DataSource_LocalFile_Mode = "text">(
    path: string,
    props?: Pick<DataSource_LocalFile_Props<Mode>, "cwd" | "mode">
): DataSource_LocalFile<Mode>
export function localFile(
    args: TemplateStringsArray,
    ...params: any[]
): DataSource_LocalFile<"text">
export function localFile(args: any, ...params: any[]) {
    if (typeof args === "string") {
        const options = params[0] ?? {}
        return new DataSource_LocalFile({
            pointOfCall: new StackTracey().slice(1),
            path: args,
            ...(options ?? {})
        })
    }
    const path = String.raw(args, ...params)
    return new DataSource_LocalFile({
        pointOfCall: new StackTracey().slice(1),
        path
    })
}

export interface TypedArrayLike {
    buffer: ArrayBuffer
    byteLength: number
}
export type DataSource_Text = DataSource_LocalFile<"text"> | string
export type DataSource_Binary = DataSource_LocalFile<"binary"> | TypedArrayLike | ArrayBuffer
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
async function promiseAllMap<K, V>(m: Map<K, Doddle<MaybePromise<V>>>): Promise<Map<K, V>> {
    const promises = seq(m)
        .map(async x => [x[0], await x[1].pull()] as [K, V])
        .toArray()
        .pull()
    const res = await Promise.all(promises)
    return new Map(res)
}
export async function resolveText(record: DataSourceRecord_Text) {
    const mp = seq(Object.entries(record))
        .map(([k, v]) => {
            return [
                k,
                doddle(async () => {
                    let resolved = v
                    if (v instanceof DataSource_LocalFile) {
                        resolved = await v.contents.pull()
                    }
                    if (typeof resolved !== "string") {
                        throw new InstrumentsError(
                            `Got an invalid data value ${v} for key ${k}. Must be a string.`
                        )
                    }
                    return resolved
                })
            ] as const
        })
        .toMap(x => x)
        .pull()
    return promiseAllMap(mp)
}
export async function resolveBinary(record: DataSourceRecord_Binary) {
    const mp = seq(Object.entries(record))
        .map(([k, v]) => {
            return [
                k,
                doddle(async () => {
                    let resolved = v as any
                    if (v instanceof DataSource_LocalFile) {
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
            ] as const
        })
        .toMap(x => x)
        .pull()

    return promiseAllMap(mp)
}
