import { phrases } from "../../utils/_string"
import { displayers } from "../../utils/displayers"
import type { Node } from "./node"

@displayers({
    simple: s => [s.why, "-->", s.needed],
    pretty: (dep, format) => {
        const neededFmt = phrases`${["lowkey", dep.needed]}`
        return [dep.why, neededFmt].join("➜ ")
    }
})
export class Relation<_Node extends Node<_Node>> {
    constructor(
        readonly why: string,
        readonly needed: Node
    ) {}
}
