import { CDK } from "@k8ts/imports"
import { manifest, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { k8ts } from "../../kind-map"
import { api_ } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Namespace_Props {}
    @k8ts(api_.v1_.Namespace)
    @relations("none")
    @equiv_cdk8s(CDK.KubeNamespace)
    @manifest({
        body(self): CDK.KubeNamespaceProps {
            return {
                spec: {}
            }
        }
    })
    export class Namespace extends ManifestResource<Namespace_Props> {
        override kind = api_.v1_.Namespace
        constructor(origin: Origin, meta: Meta | MutableMeta, props?: Namespace_Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
