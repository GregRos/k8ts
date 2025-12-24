import type { CDK } from "@k8ts/sample-interfaces"

import type {
    Ref2_Of,
    Resource_Entity,
    Resource_Ref_Keys_Of,
    Resource_Ref_Min
} from "@k8ts/instruments"
import { Resource_Child } from "@k8ts/instruments"
import { v1 } from "../../../kinds/default"
import { Container_Mount_Volume, type Container_Mount_Props } from "../container/mounts"

export interface Pod_Volume_Backend_Pvc<
    A extends Ref2_Of<v1.PersistentVolumeClaim._> = Ref2_Of<v1.PersistentVolumeClaim._>
> {
    $backend: A
    readOnly?: boolean
}

const allowedVolumeResourceKinds = [v1.ConfigMap._, v1.Secret._] as const
type VolumeResourceKind = (typeof allowedVolumeResourceKinds)[number]
export type AllowedResources = Resource_Ref_Min<VolumeResourceKind>
export interface Pod_Volume_Backend_ConfigMap<
    A extends Ref2_Of<v1.ConfigMap._> = Ref2_Of<v1.ConfigMap._>
> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in Resource_Ref_Keys_Of<A>]?: string
    }
}

export interface Pod_Volume_Backend_Secret<A extends Ref2_Of<v1.Secret._> = Ref2_Of<v1.Secret._>> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in Resource_Ref_Keys_Of<A>]?: string
    }
}

export type Pod_Volume_Backend =
    | Pod_Volume_Backend_Pvc
    | Pod_Volume_Backend_ConfigMap
    | Pod_Volume_Backend_Secret

export abstract class Pod_Volume<
    P extends Pod_Volume_Backend = Pod_Volume_Backend
> extends Resource_Child<P> {
    get kind() {
        return v1.Pod.Volume._
    }

    get sourceNamespace() {
        const backend = this.props.$backend as any as Resource_Entity
        return backend.namespace
    }

    protected __needs__(): Record<string, Resource_Entity | Resource_Entity[] | undefined> {
        return {
            backend: this.props.$backend as any
        }
    }
    Mount(options?: Omit<Container_Mount_Props, "volume">) {
        return new Container_Mount_Volume({
            volume: this,
            ...options
        })
    }

    protected abstract __submanifest__(): CDK.Volume
}

export class Pod_Volume_Pvc extends Pod_Volume<Pod_Volume_Backend_Pvc> {
    protected __submanifest__(): CDK.Volume {
        return {
            name: this.name,
            persistentVolumeClaim: {
                claimName: this.props.$backend.name,
                readOnly: this.props.readOnly
            }
        }
    }
}

function mappingsToKeyPaths(input: Record<string, string>) {
    const mappings = input
    const arr = Object.entries(mappings).map(([key, value]) => {
        return {
            key: key,
            path: value
        } satisfies CDK.KeyToPath
    })
    if (arr.length === 0) {
        return undefined
    }
    return arr
}

export class Pod_Volume_ConfigMap extends Pod_Volume<Pod_Volume_Backend_ConfigMap> {
    protected __submanifest__(): CDK.Volume {
        const mappings = mappingsToKeyPaths(this.props.mappings ?? {})

        return {
            name: this.name,
            configMap: {
                name: this.props.$backend.name,
                optional: this.props.optional,
                items: mappings
            }
        }
    }
}

export class Pod_Volume_Secret<
    Source extends Ref2_Of<v1.Secret._>
> extends Pod_Volume<Pod_Volume_Backend_Secret> {
    protected __submanifest__(): CDK.Volume {
        const mappings = mappingsToKeyPaths(this.props.mappings ?? {})

        return {
            name: this.name,
            secret: {
                secretName: this.props.$backend.name,
                optional: this.props.optional,
                items: mappings
            }
        }
    }
}
