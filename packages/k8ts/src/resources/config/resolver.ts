import { DataSource_Base, type DataSource, type ResourceRef } from "@k8ts/instruments"
import { isArrayBufferLike, isTypedArray } from "what-are-you"
import { K8tsResourceError } from "../errors"

export async function resolveDataSourceRecord(
    resource: ResourceRef,
    input: Record<string, DataSource>
) {
    const binaryData: [string, string][] = []
    const data: [string, string][] = []
    const entries = Object.entries(input ?? {}) as [string, DataSource][]
    for (const [k, v] of entries) {
        let current = v
        if (current instanceof DataSource_Base) {
            current = await current.pull()
        }
        if (isTypedArray(current) || isArrayBufferLike(current)) {
            const encoded = Buffer.from(current).toString("base64")
            binaryData.push([k, encoded])
        } else if (typeof current === "string") {
            data.push([k, current])
        } else {
            throw new K8tsResourceError(
                `Unsupported DataSource for ConfigMap ${resource} key "${k}"`
            )
        }
    }
    return {
        data: Object.fromEntries(data),
        binaryData: Object.fromEntries(binaryData)
    }
}
