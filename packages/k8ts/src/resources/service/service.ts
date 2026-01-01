import { ResourceRef, ResourceTop, type PortMapping_Input } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { MakeError } from "../../error"
import { v1 } from "../../idents/index"
import { Deployment, type DeploymentRef } from "../deployment"
import { toServicePorts } from "../utils/adapters"
import { Port } from "./service-port"
export interface ServiceFrontendClusterIp {
    type: "ClusterIP"
}

export interface ServiceFrontendLoadBalancer {
    type: "LoadBalancer"
    loadBalancerIP?: string
    loadBalancerSourceRanges?: string[]
    loadBalancerClass?: string
    allocateLoadBalancerNodePorts?: boolean
}
export type ServiceFrontend = ServiceFrontendClusterIp | ServiceFrontendLoadBalancer
export interface ServiceProps<DeployPorts extends string, ExposedPorts extends DeployPorts> {
    $ports: PortMapping_Input<ExposedPorts>
    $backend: DeploymentRef<DeployPorts>
    $frontend: ServiceFrontend
}
export interface ServiceRef<ExposedPorts extends string> extends ResourceRef<v1.Service._> {
    __PORTS__: ExposedPorts
}

export class Service<
    Name extends string = string,
    PortsExposed extends string = string
> extends ResourceTop<Name, ServiceProps<string, PortsExposed>> {
    __PORTS__!: PortsExposed
    get ident() {
        return v1.Service._
    }

    private get backend() {
        return this.props.$backend.assert(Deployment<PortsExposed>)
    }
    get ports() {
        const srcPorts = this.backend.ports
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
            backend: this.backend
        }
    }

    portRef(name: PortsExposed) {
        return new Port({
            service: this,
            name: name
        })
    }

    get hostname() {
        return `${this.name}.${this.namespace}.svc.cluster.local`
    }

    private _getPortoPart(port: PortsExposed, protocol: "http" | "https") {
        const portNumber = this.props.$ports[port]
        if (portNumber === 80 && protocol === "http") {
            return ""
        }
        if (portNumber === 443 && protocol === "https") {
            return ""
        }
        if (portNumber === undefined) {
            throw new MakeError(`Port ${port} is not defined in service ${this.name}`)
        }
        return `:${portNumber}`
    }

    protected body(): CDK.KubeServiceProps {
        const self = this
        const svcPorts = self.ports
        return {
            spec: {
                ...self.props.$frontend,
                ports: toServicePorts(svcPorts),
                selector: {
                    app: self.props.$backend.name
                }
            }
        }
    }

    address(protocol: "http" | "https", port: PortsExposed) {
        return `${protocol}://${this.hostname}${this._getPortoPart(port, protocol)}`
    }
}
