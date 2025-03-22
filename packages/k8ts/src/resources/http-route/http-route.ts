import { manifest, relations } from "@k8ts/instruments"
import { CDK } from "../../_imports"
import { gateway_v1 } from "../../api-versions"
import type { External } from "../../external"
import { k8ts } from "../../kind-map"
import { ManifestResource } from "../../node"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import type { Service } from "../service"

export type HttpRoute<Ports extends string> = HttpRoute.HttpRoute<Ports>

export namespace HttpRoute {
    const gwKind = gateway_v1.kind("Gateway")
    export interface Props<Ports extends string> {
        gateway: External<typeof gwKind>
        hostname: string
        backend: Service.Port<Ports>
    }

    const kind = gateway_v1.kind("HTTPRoute")
    @k8ts(kind)
    @relations({
        needs: self => ({
            gateway: self.props.gateway,
            service: self.props.backend.service
        })
    })
    @equiv_cdk8s(CDK.HttpRoute)
    @manifest({
        body(self): CDK.HttpRouteProps {
            return {
                spec: {
                    parentRefs: [self.props.gateway.ref()],
                    hostnames: [self.props.hostname],
                    rules: [
                        {
                            backendRefs: [self.props.backend.ref()]
                        }
                    ]
                }
            }
        }
    })
    export class HttpRoute<Ports extends string> extends ManifestResource<Props<Ports>> {
        kind = gateway_v1.kind("HTTPRoute")
    }
}
