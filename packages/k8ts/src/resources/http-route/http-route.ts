import { CDK } from "@k8ts/imports"
import { manifest, ManifestResource, relations } from "@k8ts/instruments"
import type { External } from "../../external"
import { gateway } from "../../kinds/gateway"
import { k8ts } from "../../world/kind-map"
import type { Service } from "../service"

const GatewayKind = gateway.v1.Gateway._
const HttpRouteKind = gateway.v1.HttpRoute._

export type HttpRoute<Ports extends string> = HttpRoute.HttpRoute<Ports>

export namespace HttpRoute {
    export interface HttpRoute_Props<Ports extends string> {
        $gateway: External<gateway.v1.Gateway._>
        $hostname: string
        $backend: Service.Port<Ports>
        _filters?: CDK.HttpRouteSpecRulesFilters[]
    }

    @k8ts(HttpRouteKind)
    @relations({
        needs: self => ({
            gateway: self.props.$gateway,
            service: self.props.$backend.service
        })
    })
    @manifest({
        body(self): CDK.HttpRouteProps {
            return {
                spec: {
                    parentRefs: [self.props.$gateway.ref()],
                    hostnames: [self.props.$hostname],
                    rules: [
                        {
                            backendRefs: [self.props.$backend.ref()],
                            filters: self.props._filters
                        }
                    ]
                }
            }
        }
    })
    export class HttpRoute<Ports extends string> extends ManifestResource<HttpRoute_Props<Ports>> {
        kind = HttpRouteKind
    }
}
