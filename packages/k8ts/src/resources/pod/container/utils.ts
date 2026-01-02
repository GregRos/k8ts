import type { PortFull, PortsExposed } from "@k8ts/instruments"
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

export function toContainerPorts(ports: PortsExposed<any>) {
    return seq(ports.values.values()).map(toContainerPort).toArray().pull()
}
