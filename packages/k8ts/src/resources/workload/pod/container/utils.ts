import type { Port_Full, PortExports } from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
export function toContainerPort(entry: Port_Full): K8S.ContainerPort {
    return {
        containerPort: entry.port,
        name: entry.name,
        protocol: entry.protocol,
        hostPort: entry.hostPort,
        hostIp: entry.hostIp?.text
    }
}

export function toContainerPorts(ports: PortExports<any>) {
    return seq(ports.values).map(toContainerPort).toArray().pull()
}
