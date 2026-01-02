import { ResourceTop, type ResourceRef } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { gateway } from "../idents/gateway"
import type { Service_PortRef } from "../service/service-port"

export interface HttpRoute_Props<Ports extends string> {
    $gateway: ResourceRef<gateway.v1.Gateway._>
    $hostname: string
    $backend: Service_PortRef<Ports>
    _filters?: CDK.HttpRouteSpecRulesFilters[]
}

export class HttpRoute<Name extends string, Ports extends string> extends ResourceTop<
    Name,
    HttpRoute_Props<Ports>
> {
    declare name: Name

    get ident() {
        return gateway.v1.HttpRoute._
    }

    private _getBackendRef() {
        const backendRef: CDK.HttpRouteSpecRulesBackendRefs = {
            kind: "Service",
            namespace: this.props.$backend.service.namespace,
            name: this.props.$backend.service.name,
            port: this.props.$backend.number()
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
