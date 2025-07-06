import { Map } from "immutable"
import { isNullish } from "what-are-you"
import { parseInnerKey, parseOuterKey } from "../key/parse-key"
import { SectionKey, ValueKey } from "../key/repr"
import { Meta } from "../meta"
import type { InputMeta } from "./dict-input"

export function parseMetaInput(input: InputMeta): Map<ValueKey, string> {
    if (input == null) {
        return Map()
    }
    if (Map.isMap(input)) {
        return input as Map<ValueKey, string>
    }
    if (input instanceof Meta.Meta) {
        return input["_dict"]
    }
    if (input instanceof Meta.MutableMeta) {
        return input["_meta"]["_dict"]
    }
    let map = Map<ValueKey, string>()
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
                map = map.set(inner.section(outer), vv as string)
            }
        } else {
            if (typeof value !== "string") {
                throw new Error(`Expected string value for key ${key}`)
            }
            map = map.set(outer, value as string)
        }
    }
    return map
}
