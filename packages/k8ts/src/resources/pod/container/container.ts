import type { CDK } from "@k8ts/imports"
import {
    Kinded,
    PortSet,
    relations,
    ResourcesSpec,
    Unit,
    type CmdBuilder,
    type InputPortSetRecord,
    type TaggedImage
} from "@k8ts/instruments"
import { toContainerPorts } from "../../utils/adapters"

import { seq } from "doddle"
import { mapKeys, mapValues, omitBy } from "lodash"
import { Env, type InputEnvMapping } from "../../../env"
import { k8ts } from "../../../kind-map"
import { api_ } from "../../../kinds"
import type { ManifestResource } from "../../../node"
import { SubResource } from "../../../node/sub-resource"
import { Mount as Mount_ } from "./mounts"
export type Container<Ports extends string = string> = Container.Container<Ports>
export namespace Container {
    export import Mount = Mount_
    const container_ResourcesSpec = ResourcesSpec.make({
        cpu: Unit.Cpu,
        memory: Unit.Data
    })

    type Container_Resources = (typeof container_ResourcesSpec)["__INPUT__"]
    type Container_Mount_Some = Kinded<api_.v1_.Pod_.DeviceMount | api_.v1_.Pod_.VolumeMount>
    export type Container_Mounts = {
        [key: string]: Container_Mount_Some
    }
    interface Container_Props_K8ts<Ports extends string = never> {
        $image: TaggedImage
        $ports?: InputPortSetRecord<Ports>
        $command?: CmdBuilder
        $mounts?: Container_Mounts
        $env?: InputEnvMapping
        $resources?: Container_Resources
    }

    export type Container_Props<Ports extends string = never> = Container_Props_K8ts<Ports> &
        Omit<CDK.Container, keyof Container_Props_K8ts | "name">

    @k8ts(api_.v1_.Pod_.Container)
    @relations({
        needs: self => {
            const a = self.mounts
            return mapValues(
                mapKeys(a, x => x.path),
                x => x.mount.volume
            )
        }
    })
    export class Container<Ports extends string = string> extends SubResource<
        Container_Props<Ports>
    > {
        __PORTS__!: Ports
        readonly kind = api_.v1_.Pod_.Container

        get mounts() {
            return seq(Object.entries(this.props.$mounts ?? {}))
                .map(([path, mount]) => {
                    return {
                        mount: mount as Mount.Container_Mount_Volume | Mount.Container_Mount_Device,
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
            return PortSet.make(this.props.$ports)
        }
        submanifest(): CDK.Container {
            const self = this
            const { $image, $ports, $command, $env } = self.props
            const untaggedProps = omitBy(self.props, (_, k) => k.startsWith("$"))
            let resourcesObject = self._resources()?.toObject()
            const containerPorts =
                $ports &&
                seq(toContainerPorts(PortSet.make($ports)).values())
                    .toArray()
                    .pull()
            const container: CDK.Container = {
                ...untaggedProps,
                name: self.name,
                image: $image.toString(),
                ports: containerPorts,
                resources: resourcesObject,
                command: $command?.toArray(),
                env: Env($env).toEnvVars(),
                ...self._groupedMounts()
            }
            return container
        }
        constructor(
            parent: ManifestResource,
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
                if (mount instanceof Mount.Container_Mount_Device) {
                    x.volumeDevices!.push(mount.submanifest(path))
                } else {
                    x.volumeMounts!.push(mount.submanifest(path))
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
        parent: ManifestResource,
        name: string,
        subtype: "init" | "main",
        props: Container_Props<Ports>
    ) {
        return new Container(parent, name, subtype, props)
    }
}
