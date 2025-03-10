import { CDK } from "@imports"
import { type InputPortMapping } from "@k8ts/instruments"
import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node"
import type { Deployment } from "../deployment/deployment"
import { K8tsResources } from "../kind-map"
import { toServicePorts } from "../utils/adapters"

import { dependencies } from "../../node/base"
import { Frontend as Frontend_ } from "./frontend"
import { Port as Port_ } from "./service-port"
export type Service<Ports extends string> = Service.Service<Ports>
export namespace Service {
    export import Port = Port_
    export import Frontend = Frontend_
    export interface Props<Ports extends string> {
        ports: InputPortMapping<Ports>
        backend: Deployment.Deployment<Ports>
        frontend: Frontend
    }

    @K8tsResources.register("Service")
    export class Service<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        api = v1.kind("Service")

        get ports() {
            const srcPorts = this.props.backend.ports.pull()
            const svcPorts = srcPorts.map(this.props.ports)
            return svcPorts
        }

        override get dependsOn() {
            return dependencies({
                backend: this.props.backend
            })
        }

        getPortRef(port: Ports) {
            return new Port.Port(this, port)
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
}
