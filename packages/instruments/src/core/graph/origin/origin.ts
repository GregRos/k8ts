import { Metadata } from "@k8ts/metadata"
import chalk from "chalk"
import { doddlify, seq } from "doddle"
import EventEmitter from "eventemitter3"
import { mapValues } from "lodash"
import { display } from "../../../utils/mixin/display"
import { Entity } from "../entity"
import type { ResourceRef } from "../resource/ref"
import { Resource } from "../resource/resource"
import { type OriginEventMap } from "./events"
import { GvkClassDict } from "./kind-map"
import { type Origin_Props } from "./props"
import type { OriginTracker_Binder } from "./tracker"
import { OriginContextTracker } from "./tracker"
import { OriginVertex } from "./vertex"

@display({
    simple: x => `[${x.__vertex__.shortFqn}]`,
    pretty(origin) {
        const kindPart = chalk.greenBright.bold(origin.kind)
        const originName = chalk.cyan(origin.name)
        return `${kindPart}/${originName}`
    }
})
export abstract class Origin<Props extends Origin_Props = Origin_Props> extends Entity<
    OriginVertex,
    Origin
> {
    abstract get kind(): string
    private _emitter = new EventEmitter<OriginEventMap>()
    private readonly _ownResources: Resource[] = []
    readonly metadata: Metadata
    abstract namespace: string | undefined
    private readonly _ownKids: Origin[] = []
    protected __kids__() {
        return this._ownKids
    }
    get noEmit() {
        return !!this._props.noEmit
    }
    set noEmit(value: boolean) {
        this._props.noEmit = value
    }
    protected __attach_kid__(kid: Origin): void {
        this._ownKids.push(kid)
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

        this.metadata = new Metadata(_props.metadata ?? {})
    }

    get __vertex__(): OriginVertex {
        return new OriginVertex(this)
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

        for (const target of [this.__vertex__, ...this.__vertex__.ancestors]) {
            target.entity.cast(Origin)._emitter.emit(event, data)
        }
    }
    @doddlify
    protected get __resource_kinds__(): GvkClassDict {
        const parent = this.__parent__?.cast(Origin)
        const parentKindsIfAny = parent?.__resource_kinds__ ?? []
        return new GvkClassDict([...(this._props.kinds ?? []), ...parentKindsIfAny])
    }

    protected __attach_resource__(resources: Resource | Iterable<Resource>) {
        resources = Symbol.iterator in resources ? resources : [resources]
        for (const resource of resources) {
            this._ownResources.push(resource)
            if ("metadata" in resource && resource.metadata instanceof Metadata) {
                resource.metadata.add(this.__vertex__.inheritedMeta)
            }
            this.__emit__("resource/attached", {
                origin: this,
                resource
            })
        }
    }
    protected __bind__<F extends (...args: any[]) => any>(fn: F): F {
        const bound = this.__binder__.bind(fn)
        return bound as F
    }

    protected get __binder__(): OriginTracker_Binder {
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
