import { CDK } from "@imports"
import { connections, manifest, type InputPortMapping } from "@k8ts/instruments"
import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node"
import type { Deployment } from "../deployment/deployment"
import { k8ts } from "../kind-map"
import { toServicePorts } from "../utils/adapters"

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

    const ident = v1.kind("Service")
    @k8ts(ident)
    @connections({
        needs: self => ({
            backend: self.props.backend
        })
    })
    @manifest({
        body(self): CDK.KubeServiceProps {
            const svcPorts = self.ports
            return {
                spec: {
                    ports: toServicePorts(svcPorts).toArray(),
                    selector: self.props.backend.meta.pick("%app").labels,
                    ...self.props.frontend
                }
            }
        }
    })
    export class Service<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        kind = ident

        get ports() {
            const srcPorts = this.props.backend.ports.pull()
            const svcPorts = srcPorts.map(this.props.ports)
            return svcPorts
        }

        getPortRef(port: Ports) {
            return new Port.Port(this, port)
        }
    }
}
