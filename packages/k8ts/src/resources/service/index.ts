import { CDK } from "@imports"
import type { PortMap } from "@k8ts/instruments"
import type { Meta } from "@k8ts/metadata/."
import { Base } from "../../node"
import { v1 } from "../api-version"
import type { PodTemplate } from "../pod"
import { toServicePorts } from "../utils/adapters"

let a: CDK.KubeServiceProps
export interface ServiceBackend_ClusterIp {
    type: "ClusterIp"
}

export interface ServiceBackend_LoadBalancer {
    type: "LoadBalancer"
    loadBalancerIP?: string
}

export type ServiceBackend = ServiceBackend_ClusterIp | ServiceBackend_LoadBalancer

export interface ServiceProps<Ports extends string> {
    ports: PortMap<Ports>
    backend: ServiceBackend
}
export class Service<Ports extends string> extends Base<ServiceProps<Ports>> {
    api = v1.kind("Service")
    constructor(
        meta: Meta,
        props: ServiceProps<Ports>,
        readonly target: PodTemplate
    ) {
        super(meta, props)
    }

    override manifest(): CDK.KubeServiceProps {
        return {
            metadata: this.meta.expand(),
            spec: {
                ports: toServicePorts(this.props.ports).toArray(),
                selector: this.target.meta.pick("%app").labels,
                ...this.props.backend
            }
        }
    }
}
