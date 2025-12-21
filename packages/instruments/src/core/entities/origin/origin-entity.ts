import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import { mapValues } from "lodash"
import { yamprint } from "yamprint"
import { displayers } from "../../../displayers"
import { KindMap } from "../../kind-map"
import type { Refable } from "../../reference"
import { BaseEntity } from "../base-node"
import type { ResourceEntity } from "../resource/resource-node"
import { OriginEventsEmitter, type Origin_EventMap } from "./origin-events"
import { OriginNode, type Origin_Props } from "./origin-node"
import { OriginContextTracker } from "./origin-runner"
import type { OriginStackBinder } from "./origin-stack"

@displayers({
    simple: x => `[${x.shortFqn}]`,
    pretty(origin) {
        const kindPart = chalk.greenBright.bold(origin.kind.name)
        const originName = chalk.cyan(origin.name)
        return `${kindPart}/${originName}`
    }
})
export abstract class Origin_Entity<Props extends Origin_Props = Origin_Props> extends BaseEntity<
    OriginNode,
    Origin_Entity
> {
    private _emitter = OriginEventsEmitter()

    on<EventKey extends keyof Origin_EventMap>(
        event: EventKey,
        listener: (data: Origin_EventMap[EventKey]) => void
    ) {
        this._emitter.on(event, listener as any)
    }

    onEach<EventKeys extends keyof Origin_EventMap>(handlers: {
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

        console.log(`Emitting event ${event} on Origin ${this.name}\n${yamprint(values)}`)
        for (const target of [this.node, ...this.node.ancestors]) {
            target.entity._emitter.emit(event, data)
        }
    }
    private readonly _ownResources: ResourceEntity[] = []
    private readonly _ownKids: Origin_Entity[] = []
    readonly meta: Meta

    get node(): OriginNode {
        return new OriginNode(this)
    }
    constructor(
        readonly name: string,
        protected readonly _props: Props
    ) {
        super()

        this.meta = Meta.make(_props.meta ?? {})
    }

    protected __resource_kinds__(): KindMap {
        const parentKindsIfAny = this.__parent__()?.__resource_kinds__() ?? []
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

    protected __attach_resource__(resources: ResourceEntity | Iterable<ResourceEntity>) {
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
    get resources(): Iterable<Refable> {
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
