import {
    PortExports,
    ResourcesSpec,
    Unit,
    type CmdBuilder,
    type PortExportsInput,
    type ResourceRef,
    type TaggedImage
} from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { toContainerPorts } from "../../utils/adapters"

import { Resource, ResourcePart, ResourceTop } from "@k8ts/instruments"
import { seq } from "doddle"
import { mapKeys, mapValues, omitBy } from "lodash"
import { Env } from "../../../env"
import type { EnvValue } from "../../../env/types"
import { v1 } from "../../../idents/default"
import { PodDevice, PodVolume } from "../volume"
import { ContainerDeviceMount, type ContainerDeviceMountSource } from "./mounts/device"
import { ContainerVolumeMount, type ContainerVolumeMountSource } from "./mounts/volume"
const container_ResourcesSpec = ResourcesSpec.make({
    cpu: Unit.Cpu,
    memory: Unit.Data
})

type PodContainerResources = (typeof container_ResourcesSpec)["__INPUT__"]
type PodContainerMountAny = ContainerVolumeMountSource | ContainerDeviceMountSource
export type PodContainerMounts = {
    [key: string]: PodContainerMountAny
}

export interface PodContainerEnvFrom {
    source: ResourceRef<v1.ConfigMap._> | ResourceRef<v1.Secret._>
    prefix?: string
    optional?: boolean
}
export interface PodContainerProps<
    Ports extends string = never,
    _Env extends Record<string, EnvValue> = Record<string, EnvValue>
> extends Omit<CDK.Container, "name"> {
    $image: TaggedImage
    $ports?: PortExportsInput<Ports>
    $command?: CmdBuilder
    $mounts?: PodContainerMounts
    $env?: _Env
    $envFrom?: PodContainerEnvFrom[]
    $resources?: PodContainerResources
}

export class PodContainer<Ports extends string = string> extends ResourcePart<
    PodContainerProps<Ports>
> {
    __PORTS__!: Ports
    get ident() {
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
                throw new Error(`Unsupported mount backend type: ${mount.$backend}`)
            })
            .toArray()
            .pull()
    }

    get volumes() {
        return seq(this.mounts.map(x => x.backend))
            .uniq()
            .toArray()
            .pull()
    }
    get ports() {
        return PortExports.make(this.props.$ports)
    }
    protected __submanifest__(): CDK.Container {
        const self = this
        const { $image, $ports, $command, $env } = self.props
        const untaggedProps = omitBy(self.props, (_, k) => k.startsWith("$"))
        let resourcesObject = self._resources()?.toObject()
        const containerPorts =
            $ports &&
            seq(toContainerPorts(PortExports.make($ports)).values())
                .toArray()
                .pull()

        const env = Env($env)
        for (const [key, value] of env.entries) {
            if (typeof value !== "object") {
                continue
            }
            if (!value) {
                continue
            }
            const backend = value.$backend
            if (backend instanceof Resource) {
                if (backend.namespace !== self.namespace) {
                    throw new Error(
                        `Environment variable reference "${key}" must be in the same namespace as the container "${self}", but was ${backend}"`
                    )
                }
            }
        }
        for (const vol of self.volumes) {
            if (vol.namespace !== self.namespace) {
                throw new Error(
                    `Volume reference "${vol}" had an inherited namespace ${vol.namespace}, which is different from the container "${self}"`
                )
            }
        }
        const envFroms = (self.props.$envFrom ?? []).map(ef => {
            const source = ef.source as any as Resource
            if (source.namespace !== self.namespace) {
                throw new Error(
                    `EnvFrom source reference "${source}" must be in the same namespace as the container "${self}"`
                )
            }
            if (source.is(v1.Secret._)) {
                return {
                    secretRef: {
                        optional: ef.optional,
                        name: source.name
                    }
                } as CDK.EnvFromSource
            } else if (source.is(v1.ConfigMap._)) {
                return {
                    configMapRef: {
                        optional: ef.optional,
                        name: source.name
                    }
                } as CDK.EnvFromSource
            } else {
                throw new Error(
                    `EnvFrom source reference "${source}" must be a ConfigMap or Secret, but was ${source.ident}`
                )
            }
        })
        const container: CDK.Container = {
            ...untaggedProps,
            name: self.name,
            image: $image.toString(),
            ports: containerPorts,
            resources: resourcesObject,
            command: $command?.toArray(),
            env: Env($env).toEnvVars(),
            envFrom: envFroms,
            ...self._groupedMounts()
        }
        return container
    }
    constructor(
        parent: Resource,
        name: string,
        readonly subtype: "init" | "main",
        override readonly props: PodContainerProps<Ports>
    ) {
        super(parent, name, props)
    }

    private _groupedMounts() {
        const volumeMounts = [] as CDK.VolumeMount[]
        const volumeDevices = [] as CDK.VolumeDevice[]
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
    parent: ResourceTop,
    name: string,
    subtype: "init" | "main",
    props: PodContainerProps<Ports>
) {
    return new PodContainer(parent, name, subtype, props)
}
