import { K8sResource, type ResourceRef, type Resource_Props_Top } from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { gateway } from "../../../gvks/gateway"
import type { Service_PortRef } from "../service/service-port"

export interface HttpRoute_Props<Ports extends string>
    extends Resource_Props_Top<K8S.HttpRouteSpec> {
    $gateway: ResourceRef<gateway.v1.Gateway._>
    $hostname: string
    $backend: Service_PortRef<Ports>
}

export class HttpRoute<Name extends string, Ports extends string> extends K8sResource<
    Name,
    HttpRoute_Props<Ports>
> {
    get kind() {
        return gateway.v1.HttpRoute._
    }

    private _getBackendRef() {
        const backendRef: K8S.HttpRouteSpecRulesBackendRefs = {
            kind: "Service",
            namespace: this.props.$backend.service.ident.namespace,
            name: this.props.$backend.service.ident.name,
            port: this.props.$backend.number()
        }
        return backendRef
    }

    protected __body__(): K8S.HttpRouteProps {
        const self = this
        const backendRef = this._getBackendRef()
        const spec = {
            parentRefs: [
                {
                    kind: "Gateway",
                    name: self.props.$gateway.ident.name,
                    namespace: self.props.$gateway.ident.namespace
                }
            ],
            hostnames: [self.props.$hostname],
            rules: [
                {
                    backendRefs: [backendRef]
                }
            ]
        } satisfies K8S.HttpRouteSpec
        const spec2 = merge(spec, self.props.$$manifest)
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
