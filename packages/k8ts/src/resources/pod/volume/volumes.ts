import type { CDK } from "@k8ts/sample-interfaces"

import { Rsc_Child, Rsc_Entity, type Rsc_Ref, type Rsc_Ref_Keys_Of } from "@k8ts/instruments"
import { v1 } from "../../../kinds/default"
import type { HostPathType } from "../../hostpath"
import {
    type Container_Volume_Mount_Attrs,
    type Container_Volume_Mount_Source
} from "../container/mounts/volume"

export interface Pod_Volume_Backend_Pvc<
    A extends Rsc_Ref<v1.PersistentVolumeClaim._> = Rsc_Ref<v1.PersistentVolumeClaim._>
> {
    $backend: A
    readOnly?: boolean
}
const allowedVolumeResourceKinds = [v1.ConfigMap._, v1.Secret._] as const
type VolumeResourceKind = (typeof allowedVolumeResourceKinds)[number]
export type AllowedResources = Rsc_Ref<VolumeResourceKind>

export interface Pod_Volume_Backend_HostPath {
    $backend: {
        kind: "HostPath"
        type?: HostPathType
        path: string
    }
}
export interface Pod_Volume_Backend_ConfigMap<
    A extends Rsc_Ref<v1.ConfigMap._> = Rsc_Ref<v1.ConfigMap._>
> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in Rsc_Ref_Keys_Of<A>]?: string
    }
}

export interface Pod_Volume_Backend_Secret<A extends Rsc_Ref<v1.Secret._> = Rsc_Ref<v1.Secret._>> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in Rsc_Ref_Keys_Of<A>]?: string
    }
}

export type Pod_Volume_Backend =
    | Pod_Volume_Backend_Pvc
    | Pod_Volume_Backend_ConfigMap
    | Pod_Volume_Backend_Secret
    | Pod_Volume_Backend_HostPath

type _KeysOf<T> = T extends {
    $backend: {
        keys: infer Ks extends string[]
    }
}
    ? Ks[number]
    : never

type _Mapped<T> = T extends {
    mappings: infer M
}
    ? {
          [K in _KeysOf<T>]: K extends keyof M ? M[K] : K
      }[_KeysOf<T>]
    : _KeysOf<T>
export type Pod_Volume_Backend_Known_Paths<T extends Pod_Volume_Backend> = string & _Mapped<T>

export abstract class Pod_Volume<
    P extends Pod_Volume_Backend = Pod_Volume_Backend
> extends Rsc_Child<P> {
    get kind() {
        return v1.Pod.Volume._
    }

    get namespace() {
        const backend = this.props.$backend
        if (backend instanceof Rsc_Entity) {
            return backend.namespace
        }
        return undefined
    }

    protected __needs__(): Record<string, Rsc_Entity | Rsc_Entity[] | undefined> {
        return {
            backend: this.props.$backend instanceof Rsc_Entity ? this.props.$backend : undefined
        }
    }
    Mount(
        options?: Container_Volume_Mount_Attrs<Pod_Volume_Backend_Known_Paths<P>>
    ): Container_Volume_Mount_Source {
        return {
            ...options,
            $backend: this
        }
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
    Source extends Rsc_Ref<v1.Secret._>
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

export class Pod_Volume_HostPath extends Pod_Volume<Pod_Volume_Backend_HostPath> {
    protected __submanifest__(): CDK.Volume {
        return {
            name: this.name,
            hostPath: {
                path: this.props.$backend.path,
                type: this.props.$backend.type
            }
        }
    }
}
