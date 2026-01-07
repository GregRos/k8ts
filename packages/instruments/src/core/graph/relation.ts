import { display } from "../../utils/mixin/display"
import { phrases } from "../../utils/phrase-renderer"
import type { Vertex } from "./node"

@display({
    simple: s => [s.why, "-->", s.needed],
    pretty: (dep, format) => {
        const neededFmt = phrases`${["lowkey", dep.needed]}`
        return [dep.why, neededFmt].join("➜ ")
    }
})
export class Relation<_Node extends Vertex<_Node>> {
    constructor(
        readonly why: string,
        readonly needed: Vertex
    ) {}
}
