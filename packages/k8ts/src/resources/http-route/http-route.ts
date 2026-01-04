import { ResourceTop, type ResourceRef, type Resource_Props } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { gateway } from "../idents/gateway"
import type { Service_PortRef } from "../service/service-port"

export interface HttpRoute_Props<Ports extends string> extends Resource_Props<CDK.HttpRouteSpec> {
    $gateway: ResourceRef<gateway.v1.Gateway._>
    $hostname: string
    $backend: Service_PortRef<Ports>
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

    protected __body__(): CDK.HttpRouteProps {
        const self = this
        const backendRef = this._getBackendRef()

        const spec = {
            parentRefs: [self.props.$gateway.ref],
            hostnames: [self.props.$hostname],
            rules: [
                {
                    backendRefs: [backendRef]
                }
            ]
        } satisfies CDK.HttpRouteSpec
        const spec2 = merge(spec, self.props.$overrides)
        return {
            spec: spec2
        }
    }

    protected __needs__() {
        return {
            gateway: this.props.$gateway,
            service: this.props.$backend.service
        }
    }
}
