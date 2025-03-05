import type { CDK } from "@imports"
import { Meta } from "@k8ts/metadata/."
import { NamespacedScope } from "../../graph/scope"
import { Base } from "../../node/base"
import { K8tsResources } from "../kind-map"

export interface NamespaceProps {}
@K8tsResources.register("Namespace")
export class Namespace extends Base<NamespaceProps> {
    override kind = "Namespace" as const
    constructor(meta: Meta, props?: NamespaceProps) {
        super(meta, props ?? {})
    }
    override manifest(): CDK.KubeNamespaceProps {
        return {
            metadata: this.meta.expand(),
            spec: {}
        }
    }

    scope<R extends Base>(factory: (scope: NamespacedScope) => Iterable<R>) {
        return new NamespacedScope(
            Meta.make({
                namespace: this.name
            })
        ).scope(factory)
    }
}
