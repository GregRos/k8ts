import chalk from "chalk"
import { pretty } from "../_string"
import { displayers } from "../displayers"
import { BaseNode } from "./base-node"
import { ResourceEntity } from "./resource-node"

export namespace Dependencies {
    export type Input = Record<string, ResourceEntity>
}
export function dependencies(record: Dependencies.Input) {
    return Object.entries(record).map(([key, value]) => {
        return new Relation(key, value.node)
    })
}
@displayers({
    simple: s => [s.why, "-->", s.needed],
    pretty: (dep, format) => {
        const neededFmt = pretty`${["lowkey", dep.needed]}`
        return [`${chalk.gray.italic.white(`${dep.why}`)}`, "➜ ", chalk.italic(`${neededFmt}`)]
    }
})
export class Relation<Node extends BaseNode<Node>> {
    constructor(
        readonly why: string,
        readonly needed: Node
    ) {}
}
