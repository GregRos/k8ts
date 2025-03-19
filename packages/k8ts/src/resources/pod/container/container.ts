import {
    Env,
    PortSet,
    relations,
    ResourcesSpec,
    Unit,
    type CmdBuilder,
    type InputEnvMapping,
    type InputPortSetRecord,
    type TaggedImage
} from "@k8ts/instruments"
import { Map } from "immutable"
import type { CDK } from "../../../_imports"
import { toContainerPorts, toEnvVars } from "../../utils/adapters"

import { seq } from "doddle"
import { mapKeys, mapValues } from "lodash"
import type { ManifestResource } from "../../../node"
import { SubResource } from "../../../node/sub-resource"
import { Mount as Mount_ } from "./mounts"
export type Container<Ports extends string> = Container.Container<Ports>
export namespace Container {
    export import Mount = Mount_
    const container_ResourcesSpec = ResourcesSpec.make({
        cpu: Unit.Cpu,
        memory: Unit.Data
    })

    type Resources = (typeof container_ResourcesSpec)["__INPUT__"]
    export type Mounts = {
        [key: string]: Mount.ContainerDeviceMount | Mount.ContainerVolumeMount
    }
    export interface Props<Ports extends string> {
        image: TaggedImage
        ports: InputPortSetRecord<Ports>
        command?: CmdBuilder
        mounts?: Mounts
        env?: InputEnvMapping
        securityContext?: CDK.SecurityContext
        resources?: Resources
    }
    @relations({
        needs: self => {
            const a = self.mounts
            return mapValues(
                mapKeys(a, x => x.path),
                x => x.mount.parent
            )
        }
    })
    export class Container<Ports extends string> extends SubResource<Props<Ports>> {
        get kind() {
            return this.parent.kind.subkind("Container")
        }
        get mounts() {
            return Map(this.props.mounts ?? {})
                .mapEntries(([path, mount]) => {
                    return [
                        mount,
                        {
                            mount,
                            path: path as string
                        }
                    ]
                })
                .valueSeq()
                .toArray()
        }

        get volumes() {
            return seq(this.mounts.map(x => x.mount.parent))
                .uniq()
                .toArray()
                .pull()
        }
        get ports() {
            return PortSet.make(this.props.ports)
        }
        submanifest(): CDK.Container {
            const self = this
            const { image, ports, command, env, securityContext } = self.props
            const container: CDK.Container = {
                name: self.name,
                image: image.text,
                ports: toContainerPorts(PortSet.make(ports)).valueSeq().toArray(),
                resources: self._resources()?.toObject(),
                command: command?.toArray(),
                env: toEnvVars(Env(env)).valueSeq().toArray(),
                securityContext,
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
            for (const [path, mount] of Object.entries(this.props.mounts ?? {})) {
                if (mount instanceof Mount.ContainerDeviceMount) {
                    x.volumeDevices!.push(mount.submanifest(path))
                } else {
                    x.volumeMounts!.push(mount.submanifest(path))
                }
            }
            return x
        }
        private _resources() {
            if (!this.props.resources) {
                return undefined
            }
            const { cpu, memory } = this.props.resources
            return container_ResourcesSpec.parse({
                cpu: cpu,
                memory: memory
            })
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
