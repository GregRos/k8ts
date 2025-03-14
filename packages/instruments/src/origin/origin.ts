import type { Meta } from "@k8ts/metadata"
import { seq } from "doddle"
import { Set } from "immutable"
import type { KindMap } from "../kind-map"
import { Traced } from "../tracing"

export abstract class Origin extends Traced {
    abstract readonly kind: string
    private _objects = Set<object>()
    constructor(
        readonly name: string,
        readonly meta: Meta
    ) {
        super()
        this.meta = meta.overwrite("#origin", this.toString())
    }

    attach(obj: object) {
        this._objects = this._objects.add(obj)
    }

    getAttached() {
        return this._objects
    }

    isChildOf(other: Origin) {
        return seq([this, ...this.parents])
            .some(x => x.equals(other))
            .pull()
    }

    equals(other: Origin) {
        return (
            this.kind === other.kind &&
            this.name === other.name &&
            Object.getPrototypeOf(this) === Object.getPrototypeOf(other) &&
            this.meta.equals(other.meta)
        )
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

    abstract get parent(): Origin | undefined

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
            let cur = self as Origin
            while (cur.parent && cur.parent !== cur) {
                yield cur.parent
                cur = cur.parent
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
    get parent() {
        return undefined
    }
    override get parents() {
        return []
    }

    override toString() {
        return `>> ${this.name}`
    }
}
