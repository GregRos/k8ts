import { anyCharOf, digit, letter } from "parjs/."
import { many, or, stringify, then } from "parjs/combinators"

const pEnvVarStartChar = letter().pipe(or(anyCharOf("_")))
const pEnvVarChar = pEnvVarStartChar.pipe(or(digit()))
const pEnvVarName = pEnvVarStartChar.pipe(then(pEnvVarChar.pipe(many())), stringify())

export function isValidEnvVarName(x: string) {
    return pEnvVarName.parse(x).isOk
}
