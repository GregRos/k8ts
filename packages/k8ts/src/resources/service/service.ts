import { manifest, relations, type InputPortMapping } from "@k8ts/instruments"
import { Map } from "immutable"
import { CDK } from "../../_imports"
import { api } from "../../api-kinds"
import { k8ts } from "../../kind-map"
import { ManifestResource } from "../../node"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import type { Deployment } from "../deployment/deployment"
import { toServicePorts } from "../utils/adapters"
import { Frontend as Frontend_ } from "./frontend"
import { Port as Port_ } from "./service-port"
export type Service<DeployPorts extends string, ExposedPorts extends DeployPorts> = Service.Service<
    DeployPorts,
    ExposedPorts
>
export namespace Service {
    export import Port = Port_
    export import Frontend = Frontend_
    export interface Props<DeployPorts extends string, ExposedPorts extends DeployPorts> {
        ports: InputPortMapping<ExposedPorts>
        backend: Deployment.Deployment<DeployPorts>
        frontend: Frontend
    }

    @k8ts(api.v1_.Service)
    @relations({
        needs: self => ({
            backend: self.props.backend
        })
    })
    @equiv_cdk8s(CDK.KubeService)
    @manifest({
        body(self): CDK.KubeServiceProps {
            const svcPorts = self.ports
            return {
                spec: {
                    ...self.props.frontend,
                    ports: toServicePorts(svcPorts).toArray(),
                    selector: {
                        app: self.props.backend.name
                    },
                    ...(self.props.frontend.type === "LoadBalancer"
                        ? {
                              allocateLoadBalancerNodePorts: false,
                              externalTrafficPolicy: "Local"
                          }
                        : {})
                }
            }
        }
    })
    export class Service<
        DeployPorts extends string = string,
        ExposedPorts extends DeployPorts = DeployPorts
    > extends ManifestResource<Props<DeployPorts, ExposedPorts>> {
        kind = api.v1_.Service

        get ports() {
            const srcPorts = this.props.backend.ports.pull()
            const knownPorts = Map(this.props.ports)
                .filter(x => x !== undefined)
                .keySeq()
                .toArray() as ExposedPorts[]
            const svcPorts = srcPorts.pick(...knownPorts).map(this.props.ports as any)
            return svcPorts
        }

        portRef(port: ExposedPorts) {
            return new Port.Port(this, port, this.ports.get(port).frontend)
        }
    }
}
