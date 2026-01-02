import type { CDK } from "@k8ts/sample-interfaces"

import { Resource, ResourcePart, type KeysResourceRef, type ResourceRef } from "@k8ts/instruments"
import type { HostPath_Type } from "../../hostpath"
import { v1 } from "../../idents/default"
import {
    type ContainerVolumeMount_Input,
    type ContainerVolumeMount_Unbound
} from "../container/mounts/volume"

export interface PodVolume_Backend_Pvc<
    A extends ResourceRef<v1.PersistentVolumeClaim._> = ResourceRef<v1.PersistentVolumeClaim._>
> {
    $backend: A
    readOnly?: boolean
}

export interface PodVolume_Backend_HostPath {
    $backend: {
        kind: "HostPath"
        type?: HostPath_Type
        path: string
    }
}
export interface PodVolume_Backend_ConfigMap<
    A extends ResourceRef<v1.ConfigMap._> = ResourceRef<v1.ConfigMap._>
> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in KeysResourceRef<A>]?: string
    }
}

export interface PodVolume_Backend_Secret<
    A extends ResourceRef<v1.Secret._> = ResourceRef<v1.Secret._>
> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in KeysResourceRef<A>]?: string
    }
}

export type PodVolume_Backend =
    | PodVolume_Backend_Pvc
    | PodVolume_Backend_ConfigMap
    | PodVolume_Backend_Secret
    | PodVolume_Backend_HostPath

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
export type PodVolumeBackendKnownPaths<T extends PodVolume_Backend> = string & _Mapped<T>

export abstract class PodVolume<
    P extends PodVolume_Backend = PodVolume_Backend
> extends ResourcePart<P> {
    get ident() {
        return v1.Pod.Volume._
    }

    get namespace() {
        const backend = this.props.$backend
        if (backend instanceof Resource) {
            const x = backend.namespace
            return x
        }
        return this.__parent__().namespace
    }

    protected __needs__(): Record<string, Resource | Resource[] | undefined> {
        return {
            backend: this.props.$backend instanceof Resource ? this.props.$backend : undefined
        }
    }
    Mount(
        options?: ContainerVolumeMount_Input<PodVolumeBackendKnownPaths<P>>
    ): ContainerVolumeMount_Unbound {
        return {
            ...options,
            $backend: this
        }
    }

    protected abstract __submanifest__(): CDK.Volume
}

export class PodVolume_Pvc extends PodVolume<PodVolume_Backend_Pvc> {
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

export class PodVolume_ConfigMap extends PodVolume<PodVolume_Backend_ConfigMap> {
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

export class PodVolume_Secret<
    Source extends ResourceRef<v1.Secret._>
> extends PodVolume<PodVolume_Backend_Secret> {
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

export class PodVolume_HostPath extends PodVolume<PodVolume_Backend_HostPath> {
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
