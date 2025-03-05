import type { CDK } from "@imports"
import { Meta } from "@k8ts/metadata/."
import { Base } from "../../graph/base"
import { Manifests } from "../../graph/delayed"
import { NamespacedScope } from "../../graph/scope"

export interface NamespaceProps {}
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

    Define<R extends Base>(factory: (scope: NamespacedScope) => Iterable<R>) {
        return Manifests.make(() => factory(new NamespacedScope(Meta.make())))
    }
}
