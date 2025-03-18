import { Displayers, Origin, ResourceNode } from "@k8ts/instruments"
import { Attr, Stage, Verb } from "./pretty-objects"

type Shower<T> = (x: T) => string
type TokenObject = Verb | Attr | Stage | ResourceNode | Origin
type TokenClass = abstract new (...args: any[]) => TokenObject

export function pretty(templateArgs: TemplateStringsArray, ...args: any[]) {
    args = args.map(arg => {
        const x = Displayers.tryGet(arg)
        if (x) {
            return x.pretty()
        }
        return arg
    })
    return String.raw(templateArgs, ...args)
}
