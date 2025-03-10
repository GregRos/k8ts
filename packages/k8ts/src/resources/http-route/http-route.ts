import type { CDK } from "@imports"
import type { External } from "../../external"
import { ManifestResource } from "../../node"
import { dependencies } from "../../node/base"
import { gateway_v1 } from "../api-version"
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

    @K8tsResources.register("HttpRoute")
    export class HttpRoute<Ports extends string> extends ManifestResource<Props<Ports>> {
        api = gateway_v1.kind("HttpRoute")

        override get dependsOn() {
            return dependencies({
                gateway: this.props.parent,
                service: this.props.backend.service
            })
        }
        manifest(): CDK.HttpRouteProps {
            return {
                metadata: this.meta.expand(),
                spec: {
                    parentRefs: [this.props.parent.manifest()],
                    hostnames: [this.props.hostname],
                    rules: [
                        {
                            backendRefs: [this.props.backend.manifest()]
                        }
                    ]
                }
            }
        }
    }
}
