import { CDK } from "@imports"
import { type InputPortMapping } from "@k8ts/instruments"
import { Base } from "../../node"
import { v1 } from "../api-version"
import type { Deployment } from "../deployment"
import { ServiceBackendRef } from "../http-route/backend-ref"
import { K8tsResources } from "../kind-map"
import { toServicePorts } from "../utils/adapters"

let a: CDK.KubeServiceProps
export interface ServiceFrontend_ClusterIp {
    type: "ClusterIp"
}

export interface ServiceFrontend_LoadBalancer {
    type: "LoadBalancer"
    loadBalancerIP?: string
}

export type ServiceFrontend = ServiceFrontend_ClusterIp | ServiceFrontend_LoadBalancer

export interface ServiceProps<Ports extends string> {
    ports: InputPortMapping<Ports>
    backend: Deployment
    frontend: ServiceFrontend
}
@K8tsResources.register("Service")
export class Service<Ports extends string = string> extends Base<ServiceProps<Ports>> {
    api = v1.kind("Service")

    get ports() {
        const srcPorts = this.props.backend.ports.pull()
        const svcPorts = srcPorts.map(this.props.ports)
        return svcPorts
    }

    override get dependsOn() {
        return [this.props.backend]
    }

    getBackendRef<P extends Ports>(port: P): ServiceBackendRef<P> {
        return new ServiceBackendRef(this, port)
    }

    override manifest(): CDK.KubeServiceProps {
        const svcPorts = this.ports
        return {
            metadata: this.meta.expand(),
            spec: {
                ports: toServicePorts(svcPorts).toArray(),
                selector: this.props.backend.meta.pick("%app").labels,
                ...this.props.frontend
            }
        }
    }
}
