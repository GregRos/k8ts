import {
    Port_Exports,
    ResourcesSpec,
    Unit,
    type CmdBuilder,
    type Port_Exports_Input,
    type Ref2_Of,
    type TaggedImage
} from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { toContainerPorts } from "../../utils/adapters"

import { Resource_Child, Resource_Entity, Resource_Ref_Min, Resource_Top } from "@k8ts/instruments"
import { seq } from "doddle"
import { mapKeys, mapValues, omitBy } from "lodash"
import { Env } from "../../../env"
import type { Env_Leaf } from "../../../env/types"
import { v1 } from "../../../kinds/default"
import { Container_Mount_Device, type Container_Mount } from "./mounts"
const container_ResourcesSpec = ResourcesSpec.make({
    cpu: Unit.Cpu,
    memory: Unit.Data
})

type Container_Resources = (typeof container_ResourcesSpec)["__INPUT__"]
type Container_Mount_Some = Resource_Ref_Min<
    v1.Pod.Container.DeviceMount._ | v1.Pod.Container.VolumeMount._
>
export type Container_Mounts = {
    [key: string]: Container_Mount_Some
}

export interface Container_Env_From {
    source: Ref2_Of<v1.ConfigMap._> | Ref2_Of<v1.Secret._>
    prefix?: string
    optional?: boolean
}
export interface Container_Props<
    Ports extends string = never,
    _Env extends Record<string, Env_Leaf> = Record<string, Env_Leaf>
> extends Omit<CDK.Container, "name"> {
    $image: TaggedImage
    $ports?: Port_Exports_Input<Ports>
    $command?: CmdBuilder
    $mounts?: Container_Mounts
    $env?: _Env
    $envFrom?: Container_Env_From[]
    $resources?: Container_Resources
}

export class Container<Ports extends string = string> extends Resource_Child<
    Container_Props<Ports>
> {
    __PORTS__!: Ports
    get kind() {
        return v1.Pod.Container._
    }

    protected __needs__(): Record<string, Resource_Entity | Resource_Entity[] | undefined> {
        const a = this.mounts
        return mapValues(
            mapKeys(a, x => x.path),
            x => x.mount.volume
        )
    }
    get mounts() {
        return seq(Object.entries(this.props.$mounts ?? {}))
            .map(([path, mount]) => {
                return {
                    mount: mount as Container_Mount,
                    path: path as string
                }
            })
            .toArray()
            .pull()
    }

    get volumes() {
        return seq(this.mounts.map(x => x.mount.volume))
            .uniq()
            .toArray()
            .pull()
    }
    get ports() {
        return Port_Exports.make(this.props.$ports)
    }
    protected __submanifest__(): CDK.Container {
        const self = this
        const { $image, $ports, $command, $env } = self.props
        const untaggedProps = omitBy(self.props, (_, k) => k.startsWith("$"))
        let resourcesObject = self._resources()?.toObject()
        const containerPorts =
            $ports &&
            seq(toContainerPorts(Port_Exports.make($ports)).values())
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
            if (backend instanceof Resource_Entity) {
                if (backend.namespace !== self.namespace) {
                    throw new Error(
                        `Environment variable reference "${key}" must be in the same namespace as the container "${self}", but was ${backend}"`
                    )
                }
            }
        }
        for (const vol of self.volumes) {
            if (vol.sourceNamespace !== self.namespace) {
                throw new Error(
                    `Volume reference "${vol}" must be in the same namespace as the container "${self}"`
                )
            }
        }
        const envFroms = (self.props.$envFrom ?? []).map(ef => {
            const source = ef.source as any as Resource_Entity
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
                    `EnvFrom source reference "${source}" must be a ConfigMap or Secret, but was ${source.kind}`
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
        parent: Resource_Entity,
        name: string,
        readonly subtype: "init" | "main",
        override readonly props: Container_Props<Ports>
    ) {
        super(parent, name, props)
    }

    private _groupedMounts() {
        const x = {
            volumeMounts: [],
            volumeDevices: []
        } as Pick<CDK.Container, "volumeMounts" | "volumeDevices">
        for (const mnt of this.mounts) {
            const { mount, path } = mnt
            if (mount instanceof Container_Mount_Device) {
                x.volumeDevices!.push(mount["__submanifest__"](path))
            } else {
                x.volumeMounts!.push(mount["__submanifest__"](path))
            }
        }
        return x
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
    parent: Resource_Top,
    name: string,
    subtype: "init" | "main",
    props: Container_Props<Ports>
) {
    return new Container(parent, name, subtype, props)
}
