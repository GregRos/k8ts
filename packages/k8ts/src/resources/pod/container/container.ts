import type { CDK } from "@imports"
import {
    Env,
    PortSet,
    ResourcesSpec,
    Unit,
    type CmdBuilder,
    type InputEnvMapping,
    type InputPortSetRecord,
    type TaggedImage
} from "@k8ts/instruments"
import { Map } from "immutable"
import { toContainerPorts, toEnvVars } from "../../utils/adapters"

import { Mount as Mount_ } from "./mounts"
export type Container<Ports extends string> = Container.Container<Ports>
export namespace Container {
    export import Mount = Mount_
    const container_ResourcesSpec = ResourcesSpec.make({
        cpu: Unit.Cpu,
        memory: Unit.Data
    })

    type ContainerResources = (typeof container_ResourcesSpec)["__INPUT__"]
    export type Mounts = {
        [key: string]: Mount.Device | Mount.Volume
    }
    export interface Props<Ports extends string> {
        image: TaggedImage
        ports: InputPortSetRecord<Ports>
        command?: CmdBuilder
        mounts?: Mounts
        env?: InputEnvMapping
        securityContext?: CDK.SecurityContext
        resources?: ContainerResources
    }

    export class Container<Ports extends string> {
        kind = "Container" as const
        get mounts() {
            return Map(this.props.mounts ?? {})
                .mapEntries(([path, mount]) => {
                    return [
                        mount,
                        {
                            mount,
                            path
                        }
                    ]
                })
                .toList()
        }

        get volumes() {
            return this.mounts.map(x => x.mount.parent)
        }
        get ports() {
            return PortSet.make(this.props.ports)
        }
        constructor(
            readonly name: string,
            readonly subtype: "init" | "main",
            readonly props: Props<Ports>
        ) {}

        private _groupedMounts() {
            const x = {
                volumeMounts: [],
                volumeDevices: []
            } as Pick<CDK.Container, "volumeMounts" | "volumeDevices">
            for (const [path, mount] of Object.entries(this.props.mounts ?? {})) {
                if (mount.kind === "DeviceMount") {
                    x.volumeDevices!.push(mount.manifest(path))
                } else {
                    x.volumeMounts!.push(mount.manifest(path))
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

        manifest(): CDK.Container {
            const { image, ports, command, env, securityContext } = this.props
            const container: CDK.Container = {
                name: this.name,
                image: image.text,
                ports: toContainerPorts(PortSet.make(ports)).valueSeq().toArray(),
                resources: this._resources()?.toObject(),
                command: command?.toArray(),
                env: toEnvVars(Env(env)).valueSeq().toArray(),
                securityContext,
                ...this._groupedMounts()
            }
            return container
        }
    }

    export function make<Ports extends string>(
        name: string,
        subtype: "init" | "main",
        props: Props<Ports>
    ) {
        return new Container(name, subtype, props)
    }
}
