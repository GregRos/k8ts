import type { PortMap, PortMap_Item } from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { seq } from "doddle"

export function toServicePort(entry: PortMap_Item): K8S.ServicePort {
    return {
        port: entry.frontend,
        targetPort: K8S.IntOrString.fromString(entry.name),
        protocol: entry.protocol,
        name: entry.name
    }
}

export function toServicePorts(ports: PortMap<any>) {
    return seq
        .fromObject(ports.values)
        .map(([, entry]) => toServicePort(entry))
        .toArray()
        .pull()
}
