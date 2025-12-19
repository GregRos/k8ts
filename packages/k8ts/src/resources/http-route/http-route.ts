import { CDK } from "@k8ts/imports"
import { ManifestResource } from "@k8ts/instruments"
import { gateway } from "../../kinds/gateway"
import type { External } from "../../world/external"
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

    export class HttpRoute<Ports extends string> extends ManifestResource<HttpRoute_Props<Ports>> {
        get kind() {
            return HttpRouteKind
        }

        protected body() {
            const self = this
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

        protected __needs__() {
            return {
                gateway: this.props.$gateway,
                service: this.props.$backend.service
            }
        }
    }
}
