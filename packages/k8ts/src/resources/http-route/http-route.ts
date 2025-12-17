import { CDK } from "@k8ts/imports"
import { manifest, relations } from "@k8ts/instruments"
import type { External } from "../../external"
import { k8ts } from "../../kind-map"
import { api2 } from "../../kinds"
import { ManifestResource } from "../../node"
import type { Service } from "../service"

const GatewayKind = api2.gateway.v1.Gateway._
const HttpRouteKind = api2.gateway.v1.HttpRoute._

export type HttpRoute<Ports extends string> = HttpRoute.HttpRoute<Ports>

export namespace HttpRoute {
    export interface HttpRoute_Props<Ports extends string> {
        $gateway: External<api2.gateway.v1.Gateway._>
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
