import {
    Kinded,
    PortSet,
    relations,
    ResourcesSpec,
    Unit,
    WritableDeep,
    type CmdBuilder,
    type InputPortSetRecord,
    type TaggedImage
} from "@k8ts/instruments"
import { Map } from "immutable"
import type { CDK } from "../../../_imports"
import { toContainerPorts } from "../../utils/adapters"

import { seq } from "doddle"
import { mapKeys, mapValues, omitBy } from "lodash"
import { Env, type InputEnvMapping } from "../../../env"
import { k8ts } from "../../../kind-map"
import { api } from "../../../kinds"
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

    type Resources = (typeof container_ResourcesSpec)["__INPUT__"]
    type SomeMount = Kinded<api.v1_.Pod_.DeviceMount | api.v1_.Pod_.VolumeMount>
    export type Mounts = {
        [key: string]: SomeMount
    }
    interface K8tsPropsClean<Ports extends string = never> {
        image: TaggedImage
        ports?: InputPortSetRecord<Ports>
        command?: CmdBuilder
        mounts?: Mounts
        env?: InputEnvMapping
        resources?: Resources
    }
    export type K8tsProps<Ports extends string = never> = {
        [key in keyof K8tsPropsClean<Ports> as `$${key}`]: K8tsPropsClean<Ports>[key]
    }
    export type Props<Ports extends string = never> = K8tsProps<Ports> &
        WritableDeep<Omit<CDK.Container, keyof K8tsPropsClean | "name">>

    @k8ts(api.v1_.Pod_.Container)
    @relations({
        needs: self => {
            const a = self.mounts
            return mapValues(
                mapKeys(a, x => x.path),
                x => x.mount.volume
            )
        }
    })
    export class Container<Ports extends string = string> extends SubResource<Props<Ports>> {
        __PORTS__!: Ports
        readonly kind = api.v1_.Pod_.Container

        get mounts() {
            return Map(this.props.$mounts ?? {})
                .mapEntries(([path, mount]) => {
                    return [
                        mount,
                        {
                            mount: mount as Mount.ContainerVolumeMount | Mount.ContainerDeviceMount,
                            path: path as string
                        }
                    ]
                })
                .valueSeq()
                .toArray()
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

            const container: CDK.Container = {
                ...untaggedProps,
                name: self.name,
                image: $image.toString(),
                ports: $ports && toContainerPorts(PortSet.make($ports)).valueSeq().toArray(),
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
            override readonly props: Props<Ports>
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
                if (mount instanceof Mount.ContainerDeviceMount) {
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
        props: Props<Ports>
    ) {
        return new Container(parent, name, subtype, props)
    }
}
