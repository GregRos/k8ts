import type { PortMappingEntry, PortsMapped } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"

export function toServicePort(entry: PortMappingEntry): CDK.ServicePort {
    return {
        port: entry.frontend,
        targetPort: CDK.IntOrString.fromString(entry.name),
        protocol: entry.protocol,
        name: entry.name
    }
}

export function toServicePorts(ports: PortsMapped<any>) {
    return seq(ports.values.values()).map(toServicePort).toArray().pull()
}
