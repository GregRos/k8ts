import { ResourceTop, type ResourceRef } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { gateway } from "../idents/gateway"
import type { Port } from "../service/service-port"

const GatewayKind = gateway.v1.Gateway._
const HttpRouteKind = gateway.v1.HttpRoute._

export interface HttpRoute_Props<Ports extends string> {
    $gateway: ResourceRef<gateway.v1.Gateway._>
    $hostname: string
    $backend: Port<Ports>
    _filters?: CDK.HttpRouteSpecRulesFilters[]
}

export class HttpRoute<Name extends string, Ports extends string> extends ResourceTop<
    Name,
    HttpRoute_Props<Ports>
> {
    declare name: Name

    get ident() {
        return HttpRouteKind
    }

    private _getBackendRef() {
        const backendRef: CDK.HttpRouteSpecRulesBackendRefs = {
            kind: "Service",
            namespace: this.props.$backend.service.namespace,
            name: this.props.$backend.service.name,
            port: this.props.$backend.port()
        }
        return backendRef
    }

    protected body(): CDK.HttpRouteProps {
        const self = this
        const backendRef = this._getBackendRef()

        return {
            spec: {
                parentRefs: [self.props.$gateway.ref],
                hostnames: [self.props.$hostname],
                rules: [
                    {
                        backendRefs: [backendRef],
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
