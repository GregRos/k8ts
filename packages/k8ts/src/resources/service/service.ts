import {
    ResourceRef,
    ResourceTop,
    type Ip4_Input_String,
    type PortMapping_Input,
    type Resource_Props_Top
} from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { merge } from "lodash"
import { v1 } from "../../gvks/index"
import { K8tsResourceError } from "../errors"
import type { Workload_Ref } from "../workload-ref"
import { Service_PortRef } from "./service-port"
import { toServicePorts } from "./utils"
export interface Sevice_Frontend_ClusterIp {
    type: "ClusterIP"
}

export interface Service_Frontend_LoadBalancer {
    type: "LoadBalancer"
    loadBalancerIP?: Ip4_Input_String
    loadBalancerSourceRanges?: string[]
    loadBalancerClass?: string
    allocateLoadBalancerNodePorts?: boolean
}
export type Service_Frontend = Sevice_Frontend_ClusterIp | Service_Frontend_LoadBalancer
export interface Service_Props<DeployPorts extends string, ExposedPorts extends DeployPorts>
    extends Resource_Props_Top<CDK.ServiceSpec> {
    $ports: PortMapping_Input<ExposedPorts>
    $backend: Workload_Ref<DeployPorts>
    $frontend: Service_Frontend
}
export interface Service_Ref<ExposedPorts extends string> extends ResourceRef<v1.Service._> {
    __PORTS__: ExposedPorts
}

export class Service<
    Name extends string = string,
    PortsExposed extends string = string
> extends ResourceTop<Name, Service_Props<string, PortsExposed>> {
    __PORTS__!: PortsExposed
    get kind() {
        return v1.Service._
    }

    private get _backend() {
        return this.props.$backend
    }
    get ports() {
        const srcPorts = this._backend.ports
        const knownPorts = seq(Object.entries(this.props.$ports))
            .filter(([, v]) => v !== undefined)
            .map(([k]) => k)
            .toArray()
            .pull() as PortsExposed[]
        const svcPorts = srcPorts.pick(...knownPorts).map(this.props.$ports as any)
        return svcPorts
    }

    protected override __needs__() {
        return {
            backend: this._backend
        }
    }

    portRef(name: PortsExposed) {
        return new Service_PortRef({
            service: this,
            name: name
        })
    }

    get hostname() {
        return `${this.ident.name}.${this.ident.namespace}.svc.cluster.local`
    }

    private _getPortoPort(port: PortsExposed, protocol: "http" | "https") {
        const portNumber = this.props.$ports[port]
        if (portNumber === 80 && protocol === "http") {
            return ""
        }
        if (portNumber === 443 && protocol === "https") {
            return ""
        }
        if (portNumber === undefined) {
            throw new K8tsResourceError(`Port ${port} is not defined in service ${this.ident.name}`)
        }
        return `:${portNumber}`
    }

    protected __body__(): CDK.KubeServiceProps {
        const self = this
        const svcPorts = self.ports
        const spec = {
            ...self.props.$frontend,
            ports: toServicePorts(svcPorts),
            selector: {
                app: self.props.$backend.ident.name
            }
        } satisfies CDK.ServiceSpec
        const spec2 = merge(spec, self.props.$overrides)
        const body = {
            spec: spec2
        }

        return body
    }

    address(protocol: "http" | "https", port: PortsExposed) {
        return `${protocol}://${this.hostname}${this._getPortoPort(port, protocol)}`
    }
}
