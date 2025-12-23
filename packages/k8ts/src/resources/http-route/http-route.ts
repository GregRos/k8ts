import { Resource_Top, type Resource_Ref_Full } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { gateway } from "../../kinds/gateway"
import type { Port } from "../service/service-port"

const GatewayKind = gateway.v1.Gateway._
const HttpRouteKind = gateway.v1.HttpRoute._

export interface HttpRoute_Props<Ports extends string> {
    $gateway: Resource_Ref_Full<gateway.v1.Gateway._>
    $hostname: string
    $backend: Port<Ports>
    _filters?: CDK.HttpRouteSpecRulesFilters[]
}

export class HttpRoute<Name extends string, Ports extends string> extends Resource_Top<
    Name,
    HttpRoute_Props<Ports>
> {
    declare name: Name

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
