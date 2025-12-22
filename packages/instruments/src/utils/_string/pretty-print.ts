import { Displayers } from "../displayers"

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
