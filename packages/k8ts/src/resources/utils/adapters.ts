import type { CDK } from "@imports"
import type { EnvBuilder, PortSet } from "@k8ts/instruments"
import type { PortSetEntry } from "@k8ts/instruments/dist/ports/types"

export function toContainerPort(entry: PortSetEntry): CDK.ContainerPort {
    return {
        containerPort: entry.port,
        name: entry.name,
        protocol: entry.protocol
    }
}

export function toContainerPorts(ports: PortSet<any>) {
    return ports.values.map(toContainerPort)
}

export function toEnvVars(env: EnvBuilder) {
    return env.values.map((x, key) => {
        return {
            name: key,
            value: x
        } as CDK.EnvVar
    })
}
