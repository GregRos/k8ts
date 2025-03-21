import { manifest, relations, type InputPortMapping } from "@k8ts/instruments"
import { Map } from "immutable"
import { CDK } from "../../_imports"
import { v1 } from "../../api-versions"
import { k8ts } from "../../kind-map"
import { ManifestResource } from "../../node"
import type { Deployment } from "../deployment/deployment"
import { toServicePorts } from "../utils/adapters"
import { Frontend as Frontend_ } from "./frontend"
import { Port as Port_ } from "./service-port"
export type Service<Ports extends string> = Service.Service<Ports>
export namespace Service {
    export import Port = Port_
    export import Frontend = Frontend_
    export interface Props<ExposedPorts extends DeployPorts, DeployPorts extends string> {
        ports: InputPortMapping<ExposedPorts>
        backend: Deployment.Deployment<DeployPorts>
        frontend: Frontend
    }

    const ident = v1.kind("Service")
    @k8ts(ident)
    @relations({
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
                    selector: {
                        app: self.props.backend.name
                    },
                    ...self.props.frontend
                }
            }
        }
    })
    export class Service<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        kind = ident

        get ports() {
            const srcPorts = this.props.backend.ports.pull()
            const knownPorts = Map(this.props.ports)
                .filter(x => x !== undefined)
                .keySeq()
                .toArray() as Ports[]
            const svcPorts = srcPorts.pick(...knownPorts).map(this.props.ports as any)
            return svcPorts
        }

        portRef(port: Ports) {
            return new Port.Port(this, port, this.ports.get(port).target)
        }
    }
}
