import { anyCharOf, anyStringOf, digit, lower, string, upper } from "parjs"
import { many, or, then, stringify, maybe, map } from "parjs/combinators"
import { ValueKey, SectionKey } from "./repr"
const pPrefix = anyCharOf("%^")
const pSection = string("/")

const pExtra = anyCharOf("-_.")
const pInterior = upper().pipe(or(lower(), digit(), pExtra))

const pSpecialKey = anyStringOf("name", "namespace").pipe(
    map(key => {
        return new ValueKey("", "", key)
    })
)
const pInteriorKey = pInterior.pipe(many(), stringify())
const pKey = pPrefix.pipe(
    then(pInteriorKey, pSection.pipe(then(pInteriorKey), stringify(), maybe())),
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
    return pKey.parse(key).value
}
