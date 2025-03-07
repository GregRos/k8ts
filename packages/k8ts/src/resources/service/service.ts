import { CDK } from "@imports"
import { type InputPortMapping } from "@k8ts/instruments"
import { Base } from "../../node"
import { v1 } from "../api-version"
import type { Deployment } from "../deployment/deployment"
import { K8tsResources } from "../kind-map"
import { toServicePorts } from "../utils/adapters"
import type { Frontend } from "./frontend"
import { Port } from "./service-port"

export interface Props<Ports extends string> {
    ports: InputPortMapping<Ports>
    backend: Deployment
    frontend: Frontend
}

@K8tsResources.register("Service")
export class Service<Ports extends string = string> extends Base<Props<Ports>> {
    api = v1.kind("Service")

    get ports() {
        const srcPorts = this.props.backend.ports.pull()
        const svcPorts = srcPorts.map(this.props.ports)
        return svcPorts
    }

    override get dependsOn() {
        return [this.props.backend]
    }

    getPortRef(port: Ports) {
        return new Port(this, port)
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
