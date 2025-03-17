import { Origin, ResourceNode } from "@k8ts/instruments"
import chalk from "chalk"
import { Map } from "immutable"
import { Attr, Stage, Verb } from "./pretty-objects"

function displayNode(resource: ResourceNode) {}

function displayOrigin(origin: Origin) {
    const kindPart = chalk.greenBright.bold(origin.kind.name)
    const originName = chalk.cyan(origin.name)
    return `〚${kindPart}/${originName}〛`
}

type Shower<T> = (x: T) => string
type TokenObject = Verb | Attr | Stage | ResourceNode | Origin
type TokenClass = abstract new (...args: any[]) => TokenObject

export function k8tsMessage(templateArgs: TemplateStringsArray, ...args: any[]) {
    args = args.map(x => {
        for (const [key, value] of serializers.entries()) {
            if (x instanceof key) {
                return value(x)
            }
        }
        return x
    })
    return String.raw(templateArgs, ...args)
}
const serializers = Map([
    [Verb, displayVerb],
    [Attr, displayAttr],
    [Stage, displayStage],
    [ResourceNode, displayNode],
    [Origin, displayOrigin]
] as [TokenClass, Shower<TokenObject>][])
