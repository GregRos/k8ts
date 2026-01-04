export * from "./phrases"
export * from "./renderer"
import { Display } from "../mixin/display"

export function phrases(templateArgs: TemplateStringsArray, ...args: any[]) {
    args = args.map(arg => {
        const [format, target] = Array.isArray(arg) ? arg : [undefined, arg]
        const x = Display.tryGet(target)
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
