import type { InputMeta, Meta } from "@k8ts/metadata/."
import type { KindMap } from "../kind-map"
import { Traced } from "../tracing"
import { ChildOrigin } from "./child-origin"

export abstract class Origin extends Traced {
    constructor(
        readonly name: string,
        readonly meta: Meta
    ) {
        super()
        this.meta = meta.overwrite("#origin", this.toString())
    }

    child(name: string, meta: InputMeta) {
        return new ChildOrigin(name, this.meta.add(meta), this)
    }

    abstract get registered(): KindMap
    abstract override toString(): string
    abstract get parents(): Iterable<Origin>
}
