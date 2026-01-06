import { K8tsMetadataError } from "../error"
import { Metadata_Key_Value } from "../input/key/metadata-key"
import { normalChar, parseOuterKey as parseKey, pNameValue } from "../input/key/parse-key"

export function checkMetadataValue(key: string, v: string) {
    const parsed = parseKey(key)
    if (!(parsed instanceof Metadata_Key_Value)) {
        throw new K8tsMetadataError(`Expected value key, got section key for ${key}`)
    }
    if (parsed.metaType === "label") {
        checkMetaString(`value of ${key}`, v, 63)
    } else if (parsed.metaType === "core") {
        checkNameValue(`value of ${key}`, v)
    }
}
export function checkNameValue(what: string, v: string) {
    if (!pNameValue.parse(v).isOk) {
        throw new K8tsMetadataError(`Invalid ${what}: ${v}`)
    }
    checkMetaString(what, v, 63)
}
export function checkMetaString(thing: string, input: string, length: number) {
    if (!normalChar.parse(input[0]!).isOk) {
        throw new K8tsMetadataError(`${thing} must start with an alphanumeric character.`)
    }
    if (!normalChar.parse(input[input.length - 1]!).isOk) {
        throw new K8tsMetadataError(`${thing}  must end with an alphanumeric character.`)
    }
    if (thing.length > length) {
        throw new K8tsMetadataError(`${thing} must be no more than ${length} characters.`)
    }
}
