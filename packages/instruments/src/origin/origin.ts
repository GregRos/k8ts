import type { Meta } from "@k8ts/metadata"
import { seq } from "doddle"
import type { KindMap } from "../kind-map"
import { Traced } from "../tracing"

export abstract class Origin extends Traced {
    constructor(
        readonly name: string,
        readonly meta: Meta
    ) {
        super()
        this.meta = meta.overwrite("#origin", this.toString())
    }

    child(name: string, meta: Meta.Input) {
        return new ChildOrigin(name, this.meta.overwrite(meta), this)
    }

    abstract get registered(): KindMap
    abstract override toString(): string
    abstract get parents(): Iterable<Origin>
}
export class ChildOrigin extends Origin {
    constructor(
        name: string,
        meta: Meta,
        readonly parent: Origin
    ) {
        super(name, meta)
    }

    override get registered() {
        return this.parent.registered
    }
    override get parents() {
        const self = this
        return seq(function* () {
            const cur = self
            while (cur.parent) {
                yield cur.parent
            }
        })
    }

    override toString() {
        return this.parents.join(" -> ").pull()
    }
}
export class RootOrigin extends Origin {
    constructor(
        name: string,
        universal: Meta,
        readonly registered: KindMap
    ) {
        super(name, universal)
    }
    override get parents() {
        return []
    }

    override toString() {
        return `>> ${this.name}`
    }
}
