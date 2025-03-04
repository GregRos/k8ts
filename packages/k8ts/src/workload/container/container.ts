import type { Container as CDK_Container, SecurityContext } from "@imports"
import {
    Env,
    ResourcesSpec,
    Unit,
    type CmdBuilder,
    type InputEnvMapping,
    type PortSet,
    type TaggedImage
} from "@k8ts/instruments"
import { toContainerPorts, toEnvVars } from "../../adapters"
import type { DeviceMount, VolumeMount } from "../volume/mounts"
import type { MountPath } from "../volume/types"

const container_ResourcesSpec = ResourcesSpec.make({
    cpu: Unit.Cpu,
    memory: Unit.Data
})

type ContainerResources = (typeof container_ResourcesSpec)["__INPUT__"]

export interface ContainerProps<Ports extends string> {
    image: TaggedImage
    ports: PortSet<Ports>
    command?: CmdBuilder
    mounts?: Record<MountPath, DeviceMount | VolumeMount>
    env: InputEnvMapping
    securityContext?: SecurityContext
    resources: ContainerResources
}
export class Container<Ports extends string> {
    kind = "Container" as const

    constructor(
        readonly name: string,
        readonly subtype: "init" | "main",
        readonly props: ContainerProps<Ports>
    ) {}

    static make<Ports extends string>(
        name: string,
        subtype: "init" | "main",
        props: ContainerProps<Ports>
    ) {
        return new Container(name, subtype, props)
    }

    private _groupedMounts() {
        const x = {
            volumeMounts: [],
            volumeDevices: []
        } as Pick<CDK_Container, "volumeMounts" | "volumeDevices">
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
        const { cpu, memory } = this.props.resources
        return container_ResourcesSpec.parse({
            cpu: cpu,
            memory: memory
        })
    }

    manifest(): CDK_Container {
        const { image, ports, command, env, securityContext } = this.props
        const container: CDK_Container = {
            name: this.name,
            image: image.text,
            ports: toContainerPorts(ports).valueSeq().toArray(),
            resources: this._resources().toObject(),
            command: command?.toArray(),
            env: toEnvVars(Env(env)).valueSeq().toArray(),
            securityContext,
            ...this._groupedMounts()
        }
        return container
    }
}
