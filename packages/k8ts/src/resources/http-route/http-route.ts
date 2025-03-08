import type { CDK } from "@imports"
import type { External } from "../../external"
import { Base } from "../../node"
import { gateway_v1 } from "../api-version"
import { K8tsResources } from "../kind-map"
import type { Service } from "../service"

export type HttpRoute<Ports extends string> = HttpRoute.HttpRoute<Ports>

export namespace HttpRoute {
    export interface Props<Ports extends string> {
        parent: External<"Gateway">
        hostname: string
        backend: Service.Port<Ports>
    }

    @K8tsResources.register("HttpRoute")
    export class HttpRoute<Ports extends string> extends Base<Props<Ports>> {
        api = gateway_v1.kind("HttpRoute")

        override get dependsOn() {
            return [this.props.backend.service]
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
