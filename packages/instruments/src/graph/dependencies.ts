import { pretty } from "../_string"
import { displayers } from "../displayers"
import { BaseNode } from "./base-node"
import { ResourceEntity } from "./resource-node"

export namespace Dependencies {
    export type Input = Record<string, ResourceEntity | undefined | ResourceEntity[]>
}
export function dependencies(record: Dependencies.Input) {
    return Object.entries(record).flatMap(([key, value]) => {
        if (value) {
            if (Array.isArray(value)) {
                return value.map(v => new Relation(key, v.node))
            } else if (value) {
                return new Relation(key, value.node)
            }
        }
        return []
    })
}
@displayers({
    simple: s => [s.why, "-->", s.needed],
    pretty: (dep, format) => {
        const neededFmt = pretty`${["lowkey", dep.needed]}`
        return [dep.why, neededFmt].join("➜ ")
    }
})
export class Relation<Node extends BaseNode<Node>> {
    constructor(
        readonly why: string,
        readonly needed: Node
    ) {}
}
