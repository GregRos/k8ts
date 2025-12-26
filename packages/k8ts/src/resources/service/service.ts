import { Ref2_Of, Resource_Top, type PortMapping_Input } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { MakeError } from "../../error"
import { v1 } from "../../kinds/index"
import { Deployment, type Deployment_Ref } from "../deployment"
import { toServicePorts } from "../utils/adapters"
import { Port } from "./service-port"
export interface Service_Frontend_ClusterIp {
    type: "ClusterIP"
}

export interface Service_Frontend_LoadBalancer {
    type: "LoadBalancer"
    loadBalancerIP?: string
    loadBalancerSourceRanges?: string[]
    loadBalancerClass?: string
    allocateLoadBalancerNodePorts?: boolean
}
export type Service_Frontend = Service_Frontend_ClusterIp | Service_Frontend_LoadBalancer
export interface Service_Props<DeployPorts extends string, ExposedPorts extends DeployPorts> {
    $ports: PortMapping_Input<ExposedPorts>
    $backend: Deployment_Ref<DeployPorts>
    $frontend: Service_Frontend
}
export interface Service_Ref<ExposedPorts extends string> extends Ref2_Of<v1.Service._> {
    __PORTS__: ExposedPorts
}

export class Service<
    Name extends string = string,
    Ports_Exposed extends string = string
> extends Resource_Top<Name, Service_Props<string, Ports_Exposed>> {
    __PORTS__!: Ports_Exposed
    get kind() {
        return v1.Service._
    }

    private get backend() {
        return this.props.$backend.assert(Deployment<Ports_Exposed>)
    }
    get ports() {
        const srcPorts = this.backend.ports
        const knownPorts = seq(Object.entries(this.props.$ports))
            .filter(([, v]) => v !== undefined)
            .map(([k]) => k)
            .toArray()
            .pull() as Ports_Exposed[]
        const svcPorts = srcPorts.pick(...knownPorts).map(this.props.$ports as any)
        return svcPorts
    }

    protected override __needs__() {
        return {
            backend: this.backend
        }
    }

    portRef(name: Ports_Exposed) {
        return new Port({
            service: this,
            name: name
        })
    }

    get hostname() {
        return `${this.name}.${this.namespace}.svc.cluster.local`
    }

    private _getPortoPart(port: Ports_Exposed, protocol: "http" | "https") {
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

    address(protocol: "http" | "https", port: Ports_Exposed) {
        return `${protocol}://${this.hostname}${this._getPortoPart(port, protocol)}`
    }
}
