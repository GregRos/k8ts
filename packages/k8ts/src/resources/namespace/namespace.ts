import { manifest, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { CDK } from "../../_imports"
import { api } from "../../api-kinds"
import { k8ts } from "../../kind-map"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Props {}
    @k8ts(api.v1_.Namespace)
    @relations("none")
    @equiv_cdk8s(CDK.KubeNamespace)
    @manifest({
        body(self): CDK.KubeNamespaceProps {
            return {
                spec: {}
            }
        }
    })
    export class Namespace extends ManifestResource<Props> {
        override kind = api.v1_.Namespace
        constructor(origin: Origin, meta: Meta | MutableMeta, props?: Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
