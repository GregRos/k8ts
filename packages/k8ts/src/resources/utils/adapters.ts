import type { PortMap, PortMapEntry, PortSet, PortSetEntry } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
export function toContainerPort(entry: PortSetEntry): CDK.ContainerPort {
    return {
        containerPort: entry.port,
        name: entry.name,
        protocol: entry.protocol,
        hostPort: entry.hostPort,
        hostIp: entry.hostIp?.text
    }
}

export function toContainerPorts(ports: PortSet<any>) {
    return seq(ports.values.values()).map(toContainerPort).toArray().pull()
}

export function toServicePort(entry: PortMapEntry): CDK.ServicePort {
    return {
        port: entry.frontend,
        targetPort: CDK.IntOrString.fromString(entry.name),
        protocol: entry.protocol,
        name: entry.name
    }
}

export function toServicePorts(ports: PortMap<any>) {
    return seq(ports.values.values()).map(toServicePort).toArray().pull()
}
