import chalk from "chalk"
import { displayers } from "../displayers"
import { BaseNode } from "./base-node"
import { ResourceEntity } from "./resource-node"

export namespace Dependencies {
    export type Input = Record<string, ResourceEntity>
}
export function dependencies(record: Dependencies.Input) {
    return Object.entries(record).map(([key, value]) => {
        return new NeedsEdge(key, value.node)
    })
}
@displayers({
    simple: s => [s.why, "-->", s.needed],
    pretty: (dep, format) => {
        return [`${chalk.gray.italic.white(`${dep.why}`)}`, "➜ ", dep.needed]
    }
})
export class NeedsEdge<Node extends BaseNode<Node>> {
    constructor(
        readonly why: string,
        readonly needed: Node
    ) {}
}
