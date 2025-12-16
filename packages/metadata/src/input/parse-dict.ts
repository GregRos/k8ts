import { isNullish } from "what-are-you"
import { parseInnerKey, parseOuterKey } from "../key/parse-key"
import { SectionKey } from "../key/repr"
import { Meta } from "../meta"
import type { InputMeta } from "./dict-input"

export function parseMetaInput(input: InputMeta): Map<string, string> {
    if (input == null) {
        return new Map()
    }
    if (input instanceof Map) {
        return new Map(input) as Map<string, string>
    }
    if (input instanceof Meta.Meta) {
        return new Map(input["_dict"] as Map<string, string>)
    }
    let map = new Map<string, string>()
    for (const [key, value] of Object.entries(input)) {
        const outer = parseOuterKey(key)
        if (isNullish(value)) {
            continue
        }
        if (outer instanceof SectionKey) {
            if (typeof value !== "object") {
                throw new Error(`Expected object for section key ${key}`)
            }
            for (const [kk, vv] of Object.entries(value)) {
                if (isNullish(vv)) {
                    continue
                }
                const inner = parseInnerKey(kk)

                if (typeof vv !== "string") {
                    throw new Error(`Expected string value for inner key ${kk}`)
                }
                map.set(inner.section(outer).str, vv as string)
            }
        } else {
            if (typeof value !== "string") {
                throw new Error(`Expected string value for key ${key}`)
            }
            map.set(outer.str, value as string)
        }
    }
    return map
}
