import { List, Map } from "immutable"

export function getPrototypes(target: object) {
    const prototypes = []
    let proto = Object.getPrototypeOf(target)
    while (proto) {
        prototypes.push(proto)
        proto = Object.getPrototypeOf(proto)
    }
    return List(prototypes)
}

export function bind_own_methods() {
    return <F extends abstract new (...args: any[]) => any>(target: F) => {
        for (const [key, desc] of Map(Object.getOwnPropertyDescriptors(target.prototype))) {
            if (!desc.value || typeof desc.value !== "function") {
                continue
            }
            const descValue = desc.value
            delete desc.value
            delete desc.writable
            Object.defineProperty(target.prototype, key, {
                ...desc,
                get() {
                    return descValue.bind(this)
                }
            })
        }
    }
}
