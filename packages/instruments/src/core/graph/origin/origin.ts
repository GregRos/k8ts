import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import EventEmitter from "eventemitter3"
import { mapValues } from "lodash"
import { display } from "../../../utils/mixin/display"
import { Entity } from "../entity"
import type { ResourceRef, ResourceRef_Constructor } from "../resource/ref"
import { Resource } from "../resource/resource"
import { type OriginEventMap } from "./events"
import { KindMap } from "./kind-map"
import { OriginNode, type Origin_Props } from "./node"
import type { OriginTracker_Binder } from "./tracker"
import { OriginContextTracker } from "./tracker"

@display({
    simple: x => `[${x.shortFqn}]`,
    pretty(origin) {
        const kindPart = chalk.greenBright.bold(origin.ident)
        const originName = chalk.cyan(origin.name)
        return `${kindPart}/${originName}`
    }
})
export abstract class Origin<Props extends Origin_Props = Origin_Props> extends Entity<
    OriginNode,
    Origin
> {
    get ref() {
        return {
            kind: this.ident,
            name: this.name
        }
    }
    abstract get ident(): string
    private _emitter = new EventEmitter<OriginEventMap>()
    private readonly _ownResources: Resource[] = []
    readonly meta: Meta

    protected __attach_kid__(kid: Origin<Origin_Props<ResourceRef_Constructor>>): void {
        super.__attach_kid__(kid)
        this.__emit__("origin/attached", {
            origin: this,
            child: kid
        })
    }
    equals(other: any): boolean {
        const ForwardExports = require("../resource/forward/exports").ForwardExports
        if (!other) {
            return false
        }
        if (ForwardExports.is(other)) {
            return other.equals(this)
        }
        if (other instanceof Origin) {
            return Object.is(this, other)
        }

        return false
    }
    constructor(
        readonly name: string,
        protected readonly _props: Props
    ) {
        super()

        this.meta = Meta.create(_props.meta ?? {})
    }

    get node(): OriginNode {
        return new OriginNode(this)
    }
    on<EventKey extends keyof OriginEventMap>(
        event: EventKey,
        listener: (data: OriginEventMap[EventKey]) => void
    ) {
        this._emitter.on(event, listener as any)
    }

    onMany<EventKeys extends keyof OriginEventMap>(handlers: {
        [K in EventKeys]: (data: OriginEventMap[K]) => void
    }) {
        for (const key of Object.keys(handlers) as EventKeys[]) {
            this._emitter.on(key, handlers[key] as any)
        }
    }
    protected __emit__<EventKey extends keyof OriginEventMap>(
        event: EventKey,
        data: OriginEventMap[EventKey]
    ) {
        const values = mapValues(data, v => `${v}`)

        for (const target of [this.node, ...this.node.ancestors]) {
            target.entity.assert(Origin)._emitter.emit(event, data)
        }
    }
    protected __resource_kinds__(): KindMap {
        const parent = this.__parent__()?.assert(Origin)
        const parentKindsIfAny = parent?.__resource_kinds__() ?? []
        return new KindMap([...(this._props.kinds ?? []), ...parentKindsIfAny])
    }

    get shortFqn() {
        return this.node.shortFqn
    }

    protected __attach_resource__(resources: Resource | Iterable<Resource>) {
        resources = Symbol.iterator in resources ? resources : [resources]
        for (const resource of resources) {
            this._ownResources.push(resource)
            if ("meta" in resource && resource.meta instanceof Meta.Meta) {
                resource.meta.add(this.node.inheritedMeta)
            }
            this.__emit__("resource/attached", {
                origin: this,
                resource
            })
        }
    }

    protected __binder__(): OriginTracker_Binder {
        const origin = this
        return OriginContextTracker.binder(origin)
    }

    // We don't cache this because resources can be added dynamically
    get resources(): Iterable<ResourceRef> {
        const self = this
        return seq(function* () {
            for (const resource of self._ownResources) {
                yield resource
            }
            for (const kid of self.__kids__()) {
                const asOrigin = kid as Origin
                yield* asOrigin.resources
            }
        })
    }
}
