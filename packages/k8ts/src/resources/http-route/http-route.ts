import type { CDK } from "@imports"
import { gateway_v1 } from "../../api-versions"
import { connections } from "../../decorators/node-impl"
import type { External } from "../../external"
import { ManifestResource } from "../../node"
import { dependencies } from "../../node/dependencies"
import { K8tsResources } from "../kind-map"
import type { Service } from "../service"

export type HttpRoute<Ports extends string> = HttpRoute.HttpRoute<Ports>

export namespace HttpRoute {
    const gwKind = gateway_v1.kind("Gateway")
    export interface Props<Ports extends string> {
        parent: External<typeof gwKind>
        hostname: string
        backend: Service.Port<Ports>
    }

    const kind = gateway_v1.kind("HttpRoute")
    @K8tsResources.register(kind)
    @connections({
        needs: self => ({
            gateway: self.props.parent,
            service: self.props.backend.service
        })
    })
    export class HttpRoute<Ports extends string> extends ManifestResource<Props<Ports>> {
        kind = gateway_v1.kind("HttpRoute")

        override get dependencies() {
            return dependencies({
                gateway: this.props.parent,
                service: this.props.backend.service
            })
        }
        manifestBody(): CDK.HttpRouteProps {
            return {
                metadata: this.metadata(),
                spec: {
                    parentRefs: [this.props.parent.ref()],
                    hostnames: [this.props.hostname],
                    rules: [
                        {
                            backendRefs: [this.props.backend.ref()]
                        }
                    ]
                }
            }
        }
    }
}
