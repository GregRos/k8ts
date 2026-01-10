import {
    PortExports,
    Reqs,
    Units,
    type CmdLine,
    type Image,
    type PortExports_Input,
    type Resource_Props,
    type ResourceRef
} from "@k8ts/instruments"
import type { K8S } from "@k8ts/sample-interfaces"

import { K8sResource, ResourceEntity, ResourcePart } from "@k8ts/instruments"
import { seq } from "doddle"
import { mapKeys, mapValues, merge } from "lodash"
import { Env } from "../../../../env"
import type { EnvValue } from "../../../../env/types"
import { v1 } from "../../../../gvks/default"
import { K8tsResourceError } from "../../../errors"
import { PodDevice, PodVolume } from "../volume"
import { ContainerDeviceMount, type ContainerDeviceMount_Input } from "./mounts/device"
import { ContainerVolumeMount, type ContainerVolumeMount_Unbound } from "./mounts/volume"
import { toContainerPorts } from "./utils"
const container_ResourcesSpec = new Reqs({
    cpu: Units.Cpu,
    memory: Units.Data
})

type PodContainerResources = (typeof container_ResourcesSpec)["__INPUT__"]
type PodContainerMountAny = ContainerVolumeMount_Unbound | ContainerDeviceMount_Input
export type PodContainer_Mounts = {
    [key: string]: PodContainerMountAny
}

export interface PodContainer_EnvFromItem {
    source: ResourceRef<v1.ConfigMap._> | ResourceRef<v1.Secret._>
    prefix?: string
    optional?: boolean
}
export interface PodContainer_Props<
    Ports extends string = never,
    _Env extends Record<string, EnvValue> = Record<string, EnvValue>
> extends Resource_Props<Partial<K8S.Container>> {
    $image: Image
    $ports?: PortExports_Input<Ports>
    $command?: CmdLine
    $mounts?: PodContainer_Mounts
    $env?: _Env
    $envFrom?: PodContainer_EnvFromItem[]
    $resources?: PodContainerResources
}

export class PodContainer<Ports extends string = string> extends ResourcePart<
    PodContainer_Props<Ports>
> {
    __PORTS__!: Ports
    get kind() {
        return v1.Pod.Container._
    }

    protected __needs__(): Record<string, ResourceRef | ResourceRef[]> {
        const a = this.mounts
        return mapValues(
            mapKeys(a, x => x.path),
            x => x.backend
        )
    }
    get mounts() {
        return seq(Object.entries(this.props.$mounts ?? {}))
            .map(([path, mount]: [string, PodContainerMountAny]) => {
                if (mount.$backend.is(PodDevice)) {
                    return new ContainerDeviceMount(this, {
                        $backend: mount.$backend,
                        mountPath: path
                    })
                } else if (mount.$backend.is(PodVolume)) {
                    const x = mount as any
                    return new ContainerVolumeMount(this, {
                        $backend: mount.$backend,
                        mountPath: path,
                        readOnly: x.readOnly,
                        subPath: x.subPath
                    })
                }
                throw new K8tsResourceError(`Unsupported mount backend type: ${mount.$backend}`)
            })
            .filter(x => !x.props.$noEmit)
            .toArray()
            .pull()
    }

    get volumes() {
        return seq(this.mounts.map(x => x.backend))
            .filter(x => {
                const a = 1
                return !x.noEmit
            })

            .uniq()
            .toArray()
            .pull()
    }
    get ports() {
        return PortExports(this.props.$ports)
    }
    protected __submanifest__(): K8S.Container {
        const self = this
        const { $image, $ports, $command, $env } = self.props
        let resourcesObject = self._resources()?.toObject()
        const pex = PortExports($ports)
        const containerPorts = $ports && toContainerPorts(pex)

        const env = Env($env)
        for (const [key, value] of env.entries) {
            if (typeof value !== "object") {
                continue
            }
            if (!value) {
                continue
            }
            const backend = value.$backend
            if (backend instanceof ResourceEntity) {
                if (backend.ident.namespace !== self.ident.namespace) {
                    throw new K8tsResourceError(
                        `Environment variable reference "${key}" must be in the same namespace as the container "${self}", but was ${backend}"`
                    )
                }
            }
        }
        for (const vol of self.volumes) {
            if (vol.ident.namespace !== self.ident.namespace) {
                throw new K8tsResourceError(
                    `Volume reference "${vol}" had an inherited namespace ${vol.ident.namespace}, which is different from the container "${self}"`
                )
            }
        }
        const envFroms = (self.props.$envFrom ?? []).map(ef => {
            const source = ef.source as any as ResourceEntity
            if (source.ident.namespace !== self.ident.namespace) {
                throw new K8tsResourceError(
                    `EnvFrom source reference "${source}" must be in the same namespace as the container "${self}"`
                )
            }
            if (source.is(v1.Secret._)) {
                return {
                    secretRef: {
                        optional: ef.optional,
                        name: source.ident.name
                    }
                } as K8S.EnvFromSource
            } else if (source.is(v1.ConfigMap._)) {
                return {
                    configMapRef: {
                        optional: ef.optional,
                        name: source.ident.name
                    }
                } as K8S.EnvFromSource
            } else {
                throw new K8tsResourceError(
                    `EnvFrom source reference "${source}" must be a ConfigMap or Secret, but was ${source.kind}`
                )
            }
        })
        const container: K8S.Container = {
            name: self.ident.name,
            image: $image.toString(),
            ports: containerPorts,
            resources: resourcesObject,
            command: $command?.toArray(),
            env: Env($env).toEnvVars(),
            envFrom: envFroms,
            ...self._groupedMounts()
        }
        return merge(container, self.props.$overrides)
    }
    constructor(
        parent: ResourceEntity,
        name: string,
        readonly subtype: "init" | "main",
        override readonly props: PodContainer_Props<Ports>
    ) {
        super(parent, name, props)
    }

    private _groupedMounts() {
        const volumeMounts = [] as K8S.VolumeMount[]
        const volumeDevices = [] as K8S.VolumeDevice[]
        for (const mnt of this.mounts) {
            if (mnt.backend.is(PodDevice)) {
                const deviceMount = mnt as ContainerDeviceMount
                volumeDevices!.push(deviceMount["__submanifest__"]())
            } else if (mnt.backend.is(PodVolume)) {
                const volumeMount = mnt as ContainerVolumeMount
                volumeMounts!.push(volumeMount["__submanifest__"]())
            }
        }
        return {
            volumeMounts: volumeMounts.length > 0 ? volumeMounts : undefined,
            volumeDevices: volumeDevices.length > 0 ? volumeDevices : undefined
        }
    }
    private _resources() {
        if (!this.props.$resources) {
            return undefined
        }
        const result = container_ResourcesSpec.parse(this.props.$resources)
        return result
    }
}

export function make<Ports extends string>(
    parent: K8sResource,
    name: string,
    subtype: "init" | "main",
    props: PodContainer_Props<Ports>
) {
    return new PodContainer(parent, name, subtype, props)
}
