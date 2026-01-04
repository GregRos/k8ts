import { doddle } from "doddle"
import type { K8tsManifest } from "../../manifest"
import type { Resource, ResourceTop } from "../resource"
import type { Origin } from "./origin"

export interface OriginEventMap {
    "resource/exported": {
        readonly origin: Origin
        readonly resource: ResourceTop
    }
    "resource/attached": {
        readonly origin: Origin
        readonly resource: Resource
    }
    "resource/manifested": {
        readonly origin: Origin
        readonly manifest: K8tsManifest
        readonly resource: ResourceTop
    }
    "resource/loaded": {
        readonly origin: Origin
        readonly resource: ResourceTop
    }
    "resource/serialized": {
        readonly origin: Origin
        readonly resource: ResourceTop
        readonly manifest: K8tsManifest
        content: string
    }
    "origin/attached": {
        readonly origin: Origin
        readonly child: Origin
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
