import { manifest, relations } from "@k8ts/instruments"
import { CDK } from "../../_imports"
import type { External } from "../../external"
import { k8ts } from "../../kind-map"
import { api_ } from "../../kinds"
import { ManifestResource } from "../../node"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import type { Service } from "../service"

export type HttpRoute<Ports extends string> = HttpRoute.HttpRoute<Ports>

export namespace HttpRoute {
    export interface Props<Ports extends string> {
        $gateway: External<api_.gateway_.v1_.Gateway>
        $hostname: string
        $backend: Service.Port<Ports>
        _filters?: CDK.HttpRouteSpecRulesFilters[]
    }

    @k8ts(api_.gateway_.v1_.HttpRoute)
    @relations({
        needs: self => ({
            gateway: self.props.$gateway,
            service: self.props.$backend.service
        })
    })
    @equiv_cdk8s(CDK.HttpRoute)
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
    export class HttpRoute<Ports extends string> extends ManifestResource<Props<Ports>> {
        kind = api_.gateway_.v1_.HttpRoute
    }
}
