import type { CDK } from "@k8ts/sample-interfaces"

import { Resource, ResourcePart, type KeysResourceRef, type ResourceRef } from "@k8ts/instruments"
import type { HostPathType } from "../../hostpath"
import { v1 } from "../../idents/default"
import {
    type ContainerVolumeMountAttrs,
    type ContainerVolumeMountSource
} from "../container/mounts/volume"

export interface PodVolumeBackendPvc<
    A extends ResourceRef<v1.PersistentVolumeClaim._> = ResourceRef<v1.PersistentVolumeClaim._>
> {
    $backend: A
    readOnly?: boolean
}
const allowedVolumeResourceKinds = [v1.ConfigMap._, v1.Secret._] as const
type VolumeResourceKind = (typeof allowedVolumeResourceKinds)[number]
export type AllowedResources = ResourceRef<VolumeResourceKind>

export interface PodVolumeBackendHostPath {
    $backend: {
        kind: "HostPath"
        type?: HostPathType
        path: string
    }
}
export interface PodVolumeBackendConfigMap<
    A extends ResourceRef<v1.ConfigMap._> = ResourceRef<v1.ConfigMap._>
> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in KeysResourceRef<A>]?: string
    }
}

export interface PodVolumeBackendSecret<
    A extends ResourceRef<v1.Secret._> = ResourceRef<v1.Secret._>
> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in KeysResourceRef<A>]?: string
    }
}

export type PodVolumeBackend =
    | PodVolumeBackendPvc
    | PodVolumeBackendConfigMap
    | PodVolumeBackendSecret
    | PodVolumeBackendHostPath

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
export type PodVolumeBackendKnownPaths<T extends PodVolumeBackend> = string & _Mapped<T>

export abstract class PodVolume<
    P extends PodVolumeBackend = PodVolumeBackend
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
        options?: ContainerVolumeMountAttrs<PodVolumeBackendKnownPaths<P>>
    ): ContainerVolumeMountSource {
        return {
            ...options,
            $backend: this
        }
    }

    protected abstract __submanifest__(): CDK.Volume
}

export class PodVolumePvc extends PodVolume<PodVolumeBackendPvc> {
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

export class PodVolumeConfigMap extends PodVolume<PodVolumeBackendConfigMap> {
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

export class PodVolumeSecret<
    Source extends ResourceRef<v1.Secret._>
> extends PodVolume<PodVolumeBackendSecret> {
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

export class PodVolumeHostPath extends PodVolume<PodVolumeBackendHostPath> {
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
