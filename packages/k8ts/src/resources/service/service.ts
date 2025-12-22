import { Resource_Core_Ref, Resource_Top, type InputPortMapping } from "@k8ts/instruments"
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
}
export type Service_Frontend = Service_Frontend_ClusterIp | Service_Frontend_LoadBalancer
export interface Service_Props<DeployPorts extends string, ExposedPorts extends DeployPorts> {
    $ports: InputPortMapping<ExposedPorts>
    $backend: Deployment_Ref<DeployPorts>
    $frontend: Service_Frontend
}
export interface Service_Ref<ExposedPorts extends string> extends Resource_Core_Ref<v1.Service._> {
    __PORTS__: ExposedPorts
}

export class Service<
    Name extends string = string,
    ExposedPorts extends string = string
> extends Resource_Top<Name, Service_Props<string, ExposedPorts>> {
    __PORTS__!: ExposedPorts
    get kind() {
        return v1.Service._
    }

    private get backend() {
        return this.props.$backend as Deployment<ExposedPorts>
    }
    // TODO: Ports force evaluates the backend which is not needed
    get ports() {
        const srcPorts = this.backend.ports.pull()
        const knownPorts = seq(Object.entries(this.props.$ports))
            .filter(([, v]) => v !== undefined)
            .map(([k]) => k)
            .toArray()
            .pull() as ExposedPorts[]
        const svcPorts = srcPorts.pick(...knownPorts).map(this.props.$ports as any)
        return svcPorts
    }

    protected override __needs__() {
        return {
            backend: this.backend
        }
    }

    portRef(name: ExposedPorts) {
        return new Port({
            service: this,
            name: name
        })
    }

    get hostname() {
        return `${this.name}.${this.namespace}.svc.cluster.local`
    }

    private _getPortoPart(port: ExposedPorts, protocol: "http" | "https") {
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

    address(protocol: "http" | "https", port: ExposedPorts) {
        return `${protocol}://${this.hostname}${this._getPortoPart(port, protocol)}`
    }
}
