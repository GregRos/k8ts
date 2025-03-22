import { anyCharOf, anyStringOf, digit, lower, string, upper } from "parjs"
import { many1, map, maybe, or, qthen, stringify, then, thenq } from "parjs/combinators"

import { MetadataError } from "../error"
import { SectionKey, ValueKey } from "./repr"

const cPrefix = anyCharOf("%^#")
const cSection = string("/")

const cExtra = anyCharOf("-_.").expects("'-', '_', or '.'")
export const normalChar = upper().pipe(or(lower(), digit())).expects("alphanumeric")
const cNameChar = lower().pipe(or(digit())).pipe(or("-"))
const cInterior = normalChar.pipe(or(cExtra)).expects("alphanumeric, '-', '_', or '.'")

export const pNameValue = cNameChar.pipe(many1(), stringify())
const pSpecialKey = anyStringOf("namespace", "name").pipe(
    map(key => {
        return new ValueKey("", "", key)
    })
)
const pCleanKey = cInterior.pipe(many1(), stringify())

const pSectionKey = pCleanKey.pipe(
    thenq(cSection),
    map(x => new SectionKey(x))
)

const pInnerKey = cPrefix.pipe(
    then(pCleanKey),
    map(([prefix, name]) => {
        return new ValueKey(prefix, "", name)
    })
)

const pKey = cPrefix.pipe(
    then(pCleanKey, cSection.pipe(qthen(pCleanKey), stringify(), maybe())),
    map(([prefix, nameOrSection, name]) => {
        if (name) {
            return new ValueKey(prefix, nameOrSection, name)
        }
        return new ValueKey(prefix, "", nameOrSection)
    }),
    or(pSpecialKey)
)
const pOuterKey = pKey.pipe(or(pSectionKey))
export function parseSectionKey(key: string) {
    return pSectionKey.parse(key).value
}
export function checkValue(value: string) {
    return value === "" ? "" : pCleanKey.parse(value).value
}
export function parseInnerKey(key: string) {
    return pInnerKey.parse(key).value
}
export function parseOuterKey(key: string) {
    const result = pOuterKey.parse(key)
    if (result.kind === "OK") {
        return result.value
    }
    throw new MetadataError(`Failed to parse key ${key}: ${result.toString()}`, {
        key,
        error: result.toString()
    })
}
