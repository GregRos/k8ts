import type { Port_Exports, Port_Full, Port_Map, Port_Mapping_Entry } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
export function toContainerPort(entry: Port_Full): CDK.ContainerPort {
    return {
        containerPort: entry.port,
        name: entry.name,
        protocol: entry.protocol,
        hostPort: entry.hostPort,
        hostIp: entry.hostIp?.text
    }
}

export function toContainerPorts(ports: Port_Exports<any>) {
    return seq(ports.values.values()).map(toContainerPort).toArray().pull()
}

export function toServicePort(entry: Port_Mapping_Entry): CDK.ServicePort {
    return {
        port: entry.frontend,
        targetPort: CDK.IntOrString.fromString(entry.name),
        protocol: entry.protocol,
        name: entry.name
    }
}

export function toServicePorts(ports: Port_Map<any>) {
    return seq(ports.values.values()).map(toServicePort).toArray().pull()
}
