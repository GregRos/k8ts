import { anyCharOf, anyStringOf, digit, lower, string, upper } from "parjs"
import { many, map, maybe, or, qthen, stringify, then } from "parjs/combinators"

import { MetadataError } from "../error"
import { SectionKey, ValueKey } from "./repr"

const pPrefix = anyCharOf("%^")
const pSection = string("/")

const pExtra = anyCharOf("-_.")
const pInterior = upper().pipe(or(lower(), digit(), pExtra))

const pSpecialKey = anyStringOf("namespace", "name").pipe(
    map(key => {
        return new ValueKey("", "", key)
    })
)
const pInteriorKey = pInterior.pipe(many(), stringify())
const pKey = pPrefix.pipe(
    then(pInteriorKey, pSection.pipe(qthen(pInteriorKey), stringify(), maybe())),
    map(([prefix, nameOrSection, name]) => {
        if (name === "") {
            return new SectionKey(prefix, nameOrSection)
        }
        if (name) {
            return new ValueKey(prefix, nameOrSection, name)
        }
        return new ValueKey(prefix, "", nameOrSection)
    }),
    or(pSpecialKey)
)

export function parseInnerKey(key: string) {
    return pInteriorKey.parse(key).value
}
export function parseOuterKey(key: string) {
    const result = pKey.parse(key)
    if (result.kind === "OK") {
        return result.value
    }
    throw new MetadataError(`Failed to parse key: ${result.toString()}`, {
        key,
        error: result.toString()
    })
}
