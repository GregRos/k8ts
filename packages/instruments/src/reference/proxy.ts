import { InstrumentsError } from "../error"
import { ReferenceInfo } from "./info-object"
import type { InputReference, Referenced } from "./types"

export function createReference<Target extends object>(
    refInput: InputReference<Target>
): Referenced<Target> {
    const reference = new ReferenceInfo(refInput)

    function raiseIllegal(action: string): () => never {
        return (...args: any[]) => {
            throw new InstrumentsError(
                `Tried to ${action} on a reference to ${reference.__description}, which is illegal.`,
                {
                    action,
                    args: args
                }
            )
        }
    }
    return new Proxy(reference, {
        get(target, prop) {
            if (prop === "constructor") {
                return reference.__class
            }
            if (prop === "__proto__") {
                return reference.__class.prototype
            }
            if (prop in target) {
                return (target as any)[prop]
            }
            const inner = reference.__resolver.pull() as any

            if (!(prop in inner)) {
                throw new InstrumentsError(
                    `Tried to access ${String(prop)} on a reference to ${
                        reference.__description
                    }, but it does not exist.`
                )
            }
            const result = (inner as any)[prop]
            if (typeof result === "function") {
                return result.bind(inner)
            }
            return result
        },
        getPrototypeOf(target) {
            return reference.__class.prototype
        },
        set: raiseIllegal("set"),
        deleteProperty: raiseIllegal("delete"),
        defineProperty: raiseIllegal("define"),
        ownKeys: () =>
            Reflect.ownKeys([...Object.keys(reference), ...Object.keys(reference.pull())]),
        has(target, prop) {
            return prop in reference || prop in reference.pull()
        },
        getOwnPropertyDescriptor(target, prop) {
            const desc =
                Object.getOwnPropertyDescriptor(reference, prop) ||
                Object.getOwnPropertyDescriptor(reference.pull(), prop)
            if (desc) {
                desc.configurable = false
            }
            return desc
        }
    }) as any
}
