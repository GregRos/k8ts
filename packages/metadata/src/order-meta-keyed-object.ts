import { seq } from "doddle"

function comparisonKey(key: string) {
    const bySlash = key.split("/")
    if (bySlash.length === 1) {
        return key
    }
    if (bySlash.length > 2) {
        throw new Error(`Invalid composed key ${key}, too many '/' characters.`)
    }
    const [dns, name] = bySlash
    const dnsParts = dns.split(".").reverse()
    return [...dnsParts, name].join("\uffff")
}

export function orderMetaKeyedObject(input: Record<string, string>): Record<string, any> {
    const entries = seq(Object.entries(input)).orderBy(([key]) => comparisonKey(key))

    return Object.fromEntries(entries)
}
