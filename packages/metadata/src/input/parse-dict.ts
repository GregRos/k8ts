import { isNullish } from "what-are-you"
import { K8tsMetadataError } from "../error"
import { Metadata } from "../meta"
import type { Metadata_Input } from "./dict-input"
import { DomainPrefix } from "./key/domain-prefix"
import { parseInnerKey, parseOuterKey } from "./key/parse-key"
import type { Metadata_Key_OfValue } from "./key/string-types"

export function parseMetaInput(input: Metadata_Input): Map<Metadata_Key_OfValue, string> {
    if (input == null) {
        return new Map()
    }
    if (input instanceof Map) {
        return new Map(input) as Map<Metadata_Key_OfValue, string>
    }
    if (Symbol.iterator in Object(input)) {
        let map = new Map<Metadata_Key_OfValue, string>()
        for (const item of input as Iterable<readonly [string, string]>) {
            const [key, value] = item
            map.set(key as any, value)
        }
        return map
    }
    if (input instanceof Metadata) {
        return new Map(input["_dict"])
    }
    let map = new Map<Metadata_Key_OfValue, string>()
    for (const [key, value] of Object.entries(input)) {
        const outer = parseOuterKey(key)
        if (isNullish(value)) {
            continue
        }
        if (outer instanceof DomainPrefix) {
            if (typeof value !== "object") {
                throw new K8tsMetadataError(`Expected object for section key ${key}`)
            }
            for (const [kk, vv] of Object.entries(value)) {
                if (isNullish(vv)) {
                    continue
                }
                const inner = parseInnerKey(kk)

                if (typeof vv !== "string") {
                    throw new K8tsMetadataError(`Expected string value for inner key ${kk}`)
                }
                map.set(inner.domain(outer).str, vv as string)
            }
        } else {
            if (typeof value !== "string") {
                throw new K8tsMetadataError(`Expected string value for key ${key}`)
            }
            map.set(outer.str, value as string)
        }
    }
    return map
}
