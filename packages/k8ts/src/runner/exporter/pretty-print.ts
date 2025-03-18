import { Displayers, Origin, ResourceNode } from "@k8ts/instruments"
import { Attr, Stage, Verb } from "./pretty-objects"

type Shower<T> = (x: T) => string
type TokenObject = Verb | Attr | Stage | ResourceNode | Origin
type TokenClass = abstract new (...args: any[]) => TokenObject

export function pretty(templateArgs: TemplateStringsArray, ...args: any[]) {
    args = args.map(arg => {
        const [format, target] = Array.isArray(arg) ? arg : [undefined, arg]
        const x = Displayers.tryGet(target)
        if (x) {
            return x.pretty(format)
        }
        return target
    })
    const splat = templateArgs
        .map((x, i) => {
            const arg = args[i]
            if (arg) {
                return [x, arg]
            }
            return x
        })
        .flat()
        .filter(x => x !== undefined)
    const result = splat.join("")
    return result
}
