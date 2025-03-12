import type { Meta } from "@k8ts/metadata"
import { seq } from "doddle"
import type { KindMap } from "../kind-map"
import { Traced } from "../tracing"

export abstract class Origin extends Traced {
    abstract readonly kind: string
    constructor(
        readonly name: string,
        readonly meta: Meta
    ) {
        super()
        this.meta = meta.overwrite("#origin", this.toString())
    }

    isChildOf(other: Origin) {
        return seq(this.parents).includes(other)
    }

    isParentOf(other: Origin) {
        return other.isChildOf(this)
    }

    get shortFqn() {
        return `${this.kind}/${this.name}`
    }

    get root(): Origin {
        return [...this.parents].at(-1) ?? this
    }

    abstract get registered(): KindMap
    abstract override toString(): string
    abstract get parents(): Iterable<Origin>
}
export abstract class ChildOrigin extends Origin {
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
export abstract class RootOrigin extends Origin {
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
