import { DataSource_Lazy, type DataSource, type Rsc_Ref } from "@k8ts/instruments"
import { isArrayBufferLike, isTypedArray } from "what-are-you"

export async function resolveDataSourceRecord(
    resource: Rsc_Ref,
    input: Record<string, DataSource>
) {
    const binaryData: [string, string][] = []
    const data: [string, string][] = []
    const entries = Object.entries(input ?? {}) as [string, DataSource][]
    for (const [k, v] of entries) {
        let current = v
        if (current instanceof DataSource_Lazy) {
            current = await current.get()
        }
        if (isTypedArray(current) || isArrayBufferLike(current)) {
            const encoded = Buffer.from(current).toString("base64")
            binaryData.push([k, encoded])
        } else if (typeof current === "string") {
            data.push([k, current])
        } else {
            throw new Error(`Unsupported DataSource for ConfigMap ${resource} key "${k}"`)
        }
    }
    return {
        data: Object.fromEntries(data),
        binaryData: Object.fromEntries(binaryData)
    }
}
