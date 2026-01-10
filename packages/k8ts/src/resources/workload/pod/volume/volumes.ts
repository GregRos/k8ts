import type { K8S } from "@k8ts/sample-interfaces"

import {
    ResourceEntity,
    ResourcePart,
    type Resource_Props,
    type ResourceRef,
    type ResourceRef_HasKeys
} from "@k8ts/instruments"
import { merge } from "lodash"
import { v1 } from "../../../../gvks/default"
import type { HostPath_Type } from "../../../hostpath"
import {
    type ContainerVolumeMount_Input,
    type ContainerVolumeMount_Unbound
} from "../container/mounts/volume"

export interface PodVolume_Backend_Pvc<
    A extends ResourceRef<v1.PersistentVolumeClaim._> = ResourceRef<v1.PersistentVolumeClaim._>
> extends Resource_Props<K8S.Volume> {
    $backend: A
    readOnly?: boolean
}

export interface PodVolume_Backend_HostPath extends Resource_Props<K8S.Volume> {
    $backend: {
        kind: "HostPath"
        $noEmit?: boolean
        type?: HostPath_Type
        path: string
    }
}
export interface PodVolume_Backend_ConfigMap<
    A extends ResourceRef<v1.ConfigMap._> = ResourceRef<v1.ConfigMap._>
> extends Resource_Props<K8S.Volume> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in ResourceRef_HasKeys<A>]?: string
    }
}

export interface PodVolume_Backend_Secret<
    A extends ResourceRef<v1.Secret._> = ResourceRef<v1.Secret._>
> extends Resource_Props<K8S.Volume> {
    $backend: A
    optional?: boolean
    mappings?: {
        [K in ResourceRef_HasKeys<A>]?: string
    }
}

export type PodVolume_Backend = (
    | PodVolume_Backend_Pvc
    | PodVolume_Backend_ConfigMap
    | PodVolume_Backend_Secret
    | PodVolume_Backend_HostPath
) &
    Resource_Props<K8S.Volume>

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
    get kind() {
        return v1.Pod.Volume._
    }

    get namespace() {
        const backend = this.props.$backend
        if (backend instanceof ResourceEntity) {
            const x = backend.ident.namespace
            return x
        }
        return this.__parent__.ident.namespace
    }

    protected __needs__(): Record<string, ResourceEntity | ResourceEntity[] | undefined> {
        return {
            backend: this.props.$backend instanceof ResourceEntity ? this.props.$backend : undefined
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

    protected abstract __submanifest__(): K8S.Volume
}

export class PodVolume_Pvc extends PodVolume<PodVolume_Backend_Pvc> {
    protected __submanifest__(): K8S.Volume {
        const body = {
            name: this.ident.name,
            persistentVolumeClaim: {
                claimName: this.props.$backend.ident.name,
                readOnly: this.props.readOnly
            }
        }
        return merge(body, this.props.$overrides)
    }
}

function mappingsToKeyPaths(input: Record<string, string>) {
    const mappings = input
    const arr = Object.entries(mappings).map(([key, value]) => {
        return {
            key: key,
            path: value
        } satisfies K8S.KeyToPath
    })
    if (arr.length === 0) {
        return undefined
    }
    return arr
}

export class PodVolume_ConfigMap extends PodVolume<PodVolume_Backend_ConfigMap> {
    protected __submanifest__(): K8S.Volume {
        const mappings = mappingsToKeyPaths(this.props.mappings ?? {})

        const body = {
            name: this.ident.name,
            configMap: {
                name: this.props.$backend.ident.name,
                optional: this.props.optional,
                items: mappings
            }
        }
        return merge(body, this.props.$overrides)
    }
}

export class PodVolume_Secret<
    Source extends ResourceRef<v1.Secret._>
> extends PodVolume<PodVolume_Backend_Secret> {
    protected __submanifest__(): K8S.Volume {
        const mappings = mappingsToKeyPaths(this.props.mappings ?? {})

        const body = {
            name: this.ident.name,
            secret: {
                secretName: this.props.$backend.ident.name,
                optional: this.props.optional,
                items: mappings
            }
        }
        return merge(body, this.props.$overrides)
    }
}

export class PodVolume_HostPath extends PodVolume<PodVolume_Backend_HostPath> {
    protected __submanifest__(): K8S.Volume {
        const body = {
            name: this.ident.name,
            hostPath: {
                path: this.props.$backend.path,
                type: this.props.$backend.type
            }
        }
        return merge(body, this.props.$overrides)
    }
}
