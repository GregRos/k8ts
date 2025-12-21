import { doddle } from "doddle"
import EventEmitter from "eventemitter3"
import type { BaseManifest } from "../../manifest"
import type { ManifestResource, ResourceEntity } from "../resource"
import type { Origin_Entity } from "./entity"

export function OriginEventsEmitter() {
    const em = new EventEmitter<Origin_EventMap>()
    return em
}

export function SubscribeFn(self: Origin_Entity, em: EventEmitter<Origin_EventMap>) {
    function on<EventKey extends keyof Origin_EventMap>(
        event: EventKey,
        listener: (data: Origin_EventMap[EventKey]) => void
    ): void
    function on(
        listener: <EventKey extends keyof Origin_EventMap>(
            event: EventKey,
            data: Origin_EventMap[EventKey]
        ) => void
    ): void
    function on<
        K extends keyof Origin_EventMap,
        HandledMap extends {
            [key2 in K]: (data: Origin_EventMap[key2]) => void
        }
    >(handlers: HandledMap): void
    function on(a?: any, b?: any) {
        if (typeof a === "function") {
            for (const eventName of originEventNames) {
                em.on(eventName as any, (data: any) => a(eventName as any, data))
            }
        } else if (typeof a === "string") {
            return em.on(a as any, b)
        } else if (typeof a === "object") {
            const handlers = a as any
            for (const key of Object.keys(handlers) as (keyof Origin_EventMap)[]) {
                em.on(key, handlers[key]!)
            }
        }
    }
    return on
}
export interface Origin_EventMap {
    "resource/exported": {
        readonly origin: Origin_Entity
        readonly resource: ManifestResource
    }
    "resource/attached": {
        readonly origin: Origin_Entity
        readonly resource: ResourceEntity
    }
    "resource/manifested": {
        readonly origin: Origin_Entity
        readonly manifest: BaseManifest
        readonly resource: ManifestResource
    }
    "resource/loaded": {
        readonly origin: Origin_Entity
        readonly resource: ManifestResource
    }
    "resource/serialized": {
        readonly origin: Origin_Entity
        readonly resource: ManifestResource
        readonly manifest: BaseManifest
        content: string
    }
    "origin/attached": {
        readonly origin: Origin_Entity
        readonly child: Origin_Entity
    }
}

export const originEventNames = doddle(() => {
    // Forces type checking the event names basded on the Origin_EventMap
    const obj = {
        "resource/exported": true,
        "resource/attached": true,
        "resource/manifested": true,
        "resource/loaded": true,
        "resource/serialized": true,
        "origin/attached": true
    } satisfies Record<keyof Origin_EventMap, true>
    return Object.keys(obj) as (keyof Origin_EventMap)[]
}).pull()
