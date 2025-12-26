import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import { mapValues } from "lodash"
import { displayers } from "../../../utils/displayers"
import { Entity } from "../entity"
import { Rsc_Entity } from "../resource/entity"
import type { Rsc_Ref } from "../resource/reference/refable"
import { OriginEventsEmitter, type Origin_EventMap } from "./events"
import { KindMap } from "./kind-map"
import { OriginNode, type Origin_Props } from "./node"
import type { OriginStackBinder } from "./tracker"
import { OriginContextTracker } from "./tracker"

@displayers({
    simple: x => `[${x.shortFqn}]`,
    pretty(origin) {
        const kindPart = chalk.greenBright.bold(origin.kind)
        const originName = chalk.cyan(origin.name)
        return `${kindPart}/${originName}`
    }
})
export abstract class Origin_Entity<Props extends Origin_Props = Origin_Props> extends Entity<
    OriginNode,
    Origin_Entity
> {
    get ref() {
        return {
            kind: this.kind,
            name: this.name
        }
    }
    abstract get kind(): string
    private _emitter = OriginEventsEmitter()
    private readonly _ownResources: Rsc_Entity[] = []
    private readonly _ownKids: Origin_Entity[] = []
    readonly meta: Meta

    equals(other: any): boolean {
        const FwRef_Exports = require("../resource/reference/fw-ref-exports").FwRef_Exports
        if (!other) {
            return false
        }
        if (other instanceof Origin_Entity) {
            return Object.is(this, other)
        }
        if (FwRef_Exports.is(other)) {
            return other.equals(this)
        }
        return false
    }
    constructor(
        readonly name: string,
        protected readonly _props: Props
    ) {
        super()

        this.meta = Meta.make(_props.meta ?? {})
    }

    get node(): OriginNode {
        return new OriginNode(this)
    }
    on<EventKey extends keyof Origin_EventMap>(
        event: EventKey,
        listener: (data: Origin_EventMap[EventKey]) => void
    ) {
        this._emitter.on(event, listener as any)
    }

    onMany<EventKeys extends keyof Origin_EventMap>(handlers: {
        [K in EventKeys]: (data: Origin_EventMap[K]) => void
    }) {
        for (const key of Object.keys(handlers) as EventKeys[]) {
            this._emitter.on(key, handlers[key] as any)
        }
    }
    protected __emit__<EventKey extends keyof Origin_EventMap>(
        event: EventKey,
        data: Origin_EventMap[EventKey]
    ) {
        const values = mapValues(data, v => `${v}`)

        for (const target of [this.node, ...this.node.ancestors]) {
            target.entity.assert(Origin_Entity)._emitter.emit(event, data)
        }
    }
    protected __resource_kinds__(): KindMap {
        const parent = this.__parent__()?.assert(Origin_Entity)
        const parentKindsIfAny = parent?.__resource_kinds__() ?? []
        return new KindMap([...(this._props.kinds ?? []), ...parentKindsIfAny])
    }

    get shortFqn() {
        return this.node.shortFqn
    }

    protected __attach_kid__(kid: Origin_Entity) {
        this._ownKids.push(kid)
        this.__emit__("origin/attached", {
            origin: this,
            child: kid
        })
    }

    protected __attach_resource__(resources: Rsc_Entity | Iterable<Rsc_Entity>) {
        resources = Symbol.iterator in resources ? resources : [resources]
        for (const resource of resources) {
            this._ownResources.push(resource)
            this.__emit__("resource/attached", {
                origin: this,
                resource
            })
        }
    }

    protected __kids__(): Iterable<Origin_Entity> {
        return this._ownKids
    }

    protected __binder__(): OriginStackBinder {
        const origin = this
        return OriginContextTracker.binder(origin)
    }

    // We don't cache this because resources can be added dynamically
    get resources(): Iterable<Rsc_Ref> {
        const self = this
        return seq(function* () {
            for (const resource of self._ownResources) {
                yield resource
            }
            for (const kid of self._ownKids) {
                yield* kid.resources
            }
        })
    }
}
