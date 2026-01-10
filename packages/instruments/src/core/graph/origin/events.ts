import { doddle } from "doddle"
import type { K8tsManifest } from "../../manifest"
import type { K8sResource, ResourceEntity } from "../resource"
import type { OriginEntity } from "./origin"

export interface OriginEventMap {
    "resource/exported": {
        readonly origin: OriginEntity
        readonly resource: K8sResource
    }
    "resource/attached": {
        readonly origin: OriginEntity
        readonly resource: ResourceEntity
    }
    "resource/manifested": {
        readonly origin: OriginEntity
        readonly manifest: K8tsManifest
        readonly resource: K8sResource
    }
    "resource/loaded": {
        readonly origin: OriginEntity
        readonly resource: K8sResource
    }
    "resource/serialized": {
        readonly origin: OriginEntity
        readonly resource: K8sResource
        readonly manifest: K8tsManifest
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
