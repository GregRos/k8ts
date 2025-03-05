import type { CDK } from "@imports"
import type { EnvBuilder, PortMap, PortMapEntry, PortSet, PortSetEntry } from "@k8ts/instruments"
import { IntOrString } from "../../../imports/k8s"

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

export function toServicePort(entry: PortMapEntry): CDK.ServicePort {
    return {
        port: entry.source,
        targetPort: IntOrString.fromNumber(entry.target),
        protocol: entry.protocol,
        name: entry.name
    }
}

export function toServicePorts(ports: PortMap<any>) {
    return ports.values.map(toServicePort).toList()
}

export function toEnvVars(env: EnvBuilder) {
    return env.values.map((x, key) => {
        return {
            name: key,
            value: x
        } as CDK.EnvVar
    })
}
