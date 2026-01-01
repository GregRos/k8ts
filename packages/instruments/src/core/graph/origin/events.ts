import { doddle } from "doddle"
import EventEmitter from "eventemitter3"
import type { Manifest } from "../../manifest"
import type { Resource, ResourceTop } from "../resource"
import type { OriginEntity } from "./entity"

export function OriginEventsEmitter() {
    const em = new EventEmitter<OriginEventMap>()
    return em
}

export function SubscribeFn(self: OriginEntity, em: EventEmitter<OriginEventMap>) {
    function on<EventKey extends keyof OriginEventMap>(
        event: EventKey,
        listener: (data: OriginEventMap[EventKey]) => void
    ): void
    function on(
        listener: <EventKey extends keyof OriginEventMap>(
            event: EventKey,
            data: OriginEventMap[EventKey]
        ) => void
    ): void
    function on<
        K extends keyof OriginEventMap,
        HandledMap extends {
            [key2 in K]: (data: OriginEventMap[key2]) => void
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
            for (const key of Object.keys(handlers) as (keyof OriginEventMap)[]) {
                em.on(key, handlers[key]!)
            }
        }
    }
    return on
}
export interface OriginEventMap {
    "resource/exported": {
        readonly origin: OriginEntity
        readonly resource: ResourceTop
    }
    "resource/attached": {
        readonly origin: OriginEntity
        readonly resource: Resource
    }
    "resource/manifested": {
        readonly origin: OriginEntity
        readonly manifest: Manifest
        readonly resource: ResourceTop
    }
    "resource/loaded": {
        readonly origin: OriginEntity
        readonly resource: ResourceTop
    }
    "resource/serialized": {
        readonly origin: OriginEntity
        readonly resource: ResourceTop
        readonly manifest: Manifest
        content: string
    }
    "origin/attached": {
        readonly origin: OriginEntity
        readonly child: OriginEntity
    }
}

export const originEventNames = doddle(() => {
    // Forces type checking the event names basded on the OriginEventMap
    const obj = {
        "resource/exported": true,
        "resource/attached": true,
        "resource/manifested": true,
        "resource/loaded": true,
        "resource/serialized": true,
        "origin/attached": true
    } satisfies Record<keyof OriginEventMap, true>
    return Object.keys(obj) as (keyof OriginEventMap)[]
}).pull()
