import type { CDK } from "@imports"
import { Api } from "@k8ts/instruments"
import type { External } from "../../external"
import { Base } from "../../node"
import { K8tsResources } from "../kind-map"
import type { ServiceBackendRef } from "./backend-ref"

export interface HttpRouteProps<Ports extends string> {
    parent: External<"Gateway">
    hostname: string
    backend: ServiceBackendRef<Ports>
}
@K8tsResources.register("HttpRoute")
export class HttpRoute<Ports extends string> extends Base<HttpRouteProps<Ports>> {
    api = Api.group("networking.k8s.io").version("v1").kind("HttpRoute")

    manifest(): CDK.HttpRouteProps {
        return {
            metadata: this.meta.expand(),
            spec: {
                parentRefs: [this.props.parent.manifest()],
                hostnames: [this.props.hostname],
                rules: [
                    {
                        backendRefs: [this.props.backend.manifest()]
                    }
                ]
            }
        }
    }
}
