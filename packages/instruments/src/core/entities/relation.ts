import type { BaseNode } from "."
import { pretty } from "../../utils/_string"
import { displayers } from "../../utils/displayers"

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
