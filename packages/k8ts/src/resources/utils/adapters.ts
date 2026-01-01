import type { PortExports, PortFull, PortMap, PortMappingEntry } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
export function toContainerPort(entry: PortFull): CDK.ContainerPort {
    return {
        containerPort: entry.port,
        name: entry.name,
        protocol: entry.protocol,
        hostPort: entry.hostPort,
        hostIp: entry.hostIp?.text
    }
}

export function toContainerPorts(ports: PortExports<any>) {
    return seq(ports.values.values()).map(toContainerPort).toArray().pull()
}

export function toServicePort(entry: PortMappingEntry): CDK.ServicePort {
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
