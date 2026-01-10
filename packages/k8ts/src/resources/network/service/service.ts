import {
    K8sResource,
    ResourceRef,
    type Ip4_Input_String,
    type PortMap,
    type PortMapping_Input,
    type Resource_Props_Top
} from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { merge } from "lodash"
import { v1 } from "../../../gvks/index"
import { K8tsResourceError } from "../../errors"
import type { Workload_Ref } from "../../workload/workload-ref"
import { Service_PortRef } from "./service-port"
import { toServicePorts } from "./utils"

/** Short for ClusterIp with ClusterIp: None */
export interface Service_Frontend_Headless {
    type: "Headless"
}
export interface Sevice_Frontend_ClusterIp {
    type: "ClusterIP"
    clusterIp?: Ip4_Input_String | "None"
}

export interface Service_Frontend_LoadBalancer {
    type: "LoadBalancer"
    loadBalancerIP?: Ip4_Input_String
    loadBalancerSourceRanges?: string[]
    loadBalancerClass?: string
    allocateLoadBalancerNodePorts?: boolean
    clusterIp?: Ip4_Input_String
}
export type Service_Frontend =
    | Sevice_Frontend_ClusterIp
    | Service_Frontend_LoadBalancer
    | Service_Frontend_Headless
export interface Service_Props<DeployPorts extends string, ExposedPorts extends DeployPorts>
    extends Resource_Props_Top<K8S.ServiceSpec> {
    $ports: PortMapping_Input<ExposedPorts>
    $backend: Workload_Ref<DeployPorts>
    $frontend: Service_Frontend
}
export interface Service_Ref<PortsExposed extends string> extends ResourceRef<v1.Service._> {
    ports: PortMap<PortsExposed>
}

export class Service<
    Name extends string = string,
    PortsExposed extends string = string
> extends K8sResource<Name, Service_Props<string, PortsExposed>> {
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

    private _getProtoPort(port: PortsExposed, protocol: "http" | "https") {
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

    private _frontend() {
        if (this.props.$frontend.type === "Headless") {
            return {
                type: "ClusterIP",
                clusterIp: "None"
            } satisfies K8S.ServiceSpec
        }
        return this.props.$frontend satisfies K8S.ServiceSpec
    }

    protected __body__(): K8S.KubeServiceProps {
        const self = this
        const svcPorts = self.ports
        const spec = {
            ...self._frontend(),

            ports: toServicePorts(svcPorts),
            selector: {
                app: self.props.$backend.ident.name
            }
        } satisfies K8S.ServiceSpec
        const spec2 = merge(spec, self.props.$$manifest)
        const body = {
            spec: spec2
        }

        return body
    }

    address(protocol: "http" | "https", port: PortsExposed) {
        return `${protocol}://${this.hostname}${this._getProtoPort(port, protocol)}`
    }
}
