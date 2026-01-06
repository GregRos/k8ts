type Pair<X> = [X, X]
export function mergeWith<K1, K2, V1, V2, V3>(
    map1: Map<K1, V1>,
    map2: Map<K2, V2>,
    merger: (val1: V1, val2: V2, key: K1 | K2) => V3
): Map<K1 | K2, V1 | V2 | V3> {
    const result = new Map<K1 | K2, V1 | V2 | V3>(map1)
    const allKeys = new Set<K1 | K2>([...map1.keys(), ...map2.keys()])
    for (const k of allKeys) {
        const val1 = map1.get(k as K1)
        const val2 = map2.get(k as K2)
        if (val1 !== undefined && val2 !== undefined) {
            result.set(k, merger(val1, val2, k))
        } else if (val2 !== undefined) {
            result.set(k, val2)
        }
    }
    return result
}

export function merge<K1, K2, V1, V2>(map1: Map<K1, V1>, map2: Map<K2, V2>): Map<K1 | K2, V1 | V2> {
    return mergeWith(map1, map2, (_old, _new) => _new)
}

export function filterMap<K, V>(map: Map<K, V>, pred: (v: V, k: K) => boolean): Map<K, V> {
    const out = new Map<K, V>()
    for (const [k, v] of map.entries()) {
        if (pred(v, k)) out.set(k, v)
    }
    return out
}

export function mapKeys<K, V, NK>(map: Map<K, V>, fn: (k: K) => NK): Map<NK, V> {
    const out = new Map<NK, V>()
    for (const [k, v] of map.entries()) {
        out.set(fn(k), v)
    }
    return out
}

export function mapValues<K, V, NV>(map: Map<K, V>, fn: (v: V, k: K) => NV): Map<K, NV> {
    const out = new Map<K, NV>()
    for (const [k, v] of map.entries()) {
        out.set(k, fn(v, k))
    }
    return out
}

export function toObject<K, V>(map: Map<K, V>): { [k: string]: V } {
    const out: { [k: string]: V } = {}
    for (const [k, v] of map.entries()) {
        const key = (k as any)?.str ?? String(k)
        out[key] = v
    }
    return out
}

export function toJS<K, V>(map: Map<K, V>): { [k: string]: V } {
    return toObject(map)
}

export function equalsMap<K, V>(a: Map<K, V>, b: Map<K, V>): boolean {
    if (a.size !== b.size) return false
    for (const [ka, va] of a.entries()) {
        let found = false
        for (const [kb, vb] of b.entries()) {
            const sa = (ka as any)?.str ?? ka
            const sb = (kb as any)?.str ?? kb
            if (sa === sb) {
                found = true
                if (va !== vb) return false
                break
            }
        }
        if (!found) return false
    }
    return true
}

export function mapFromObject<V>(obj: { [k: string]: V }): Map<string, V> {
    const map = new Map<string, V>()
    for (const k of Object.keys(obj)) {
        map.set(k, obj[k])
    }
    return map
}

export function mapToObject<V>(map: Map<string, V>): { [k: string]: V } {
    const obj: { [k: string]: V } = {}
    for (const [k, v] of map.entries()) {
        obj[k] = v
    }
    return obj
}

export type SourcedPropertyDescriptor = PropertyDescriptor & {
    source: object
}
export function getDeepPropertyDescriptor(
    obj: any,
    propertyKey: string | symbol
): SourcedPropertyDescriptor | undefined {
    let current = obj
    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, propertyKey)
        if (descriptor) {
            return {
                ...descriptor,
                source: current
            }
        }
        current = Object.getPrototypeOf(current)
    }
    return undefined
}
