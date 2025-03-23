import {
    manifest,
    Refable,
    relations,
    ResourceEntity,
    type InputPortMapping
} from "@k8ts/instruments"
import { Map } from "immutable"
import { CDK } from "../../_imports"
import { k8ts } from "../../kind-map"
import { api } from "../../kinds"
import { ManifestResource } from "../../node"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { Deployment } from "../deployment"
import { toServicePorts } from "../utils/adapters"
import { Frontend as Frontend_ } from "./frontend"
import { Port as Port_ } from "./service-port"
export type Service<ExposedPorts extends string = string> = Service.Service<ExposedPorts>
export namespace Service {
    export import Port = Port_
    export import Frontend = Frontend_
    export interface Props<DeployPorts extends string, ExposedPorts extends DeployPorts> {
        ports: InputPortMapping<ExposedPorts>
        backend: Deployment.AbsDeployment<DeployPorts>
        frontend: Frontend
    }
    export type AbsService<ExposedPorts extends string> = Refable<api.v1_.Service> & {
        __PORTS__: ExposedPorts
    }
    @k8ts(api.v1_.Service)
    @relations({
        needs: self => ({
            backend: self.backend as ResourceEntity
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
    export class Service<ExposedPorts extends string = string> extends ManifestResource<
        Props<string, ExposedPorts>
    > {
        __PORTS__!: ExposedPorts
        kind = api.v1_.Service

        private get backend() {
            return this.props.backend as Deployment<ExposedPorts>
        }
        get ports() {
            const srcPorts = this.backend.ports.pull()
            const knownPorts = Map(this.props.ports)
                .filter(x => x !== undefined)
                .keySeq()
                .toArray() as ExposedPorts[]
            const svcPorts = srcPorts.pick(...knownPorts).map(this.props.ports as any)
            return svcPorts
        }

        portRef(name: ExposedPorts) {
            return new Port.Port({
                service: this,
                name: name
            })
        }
    }
}
