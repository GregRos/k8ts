import type { CDK } from "@imports"
import { manifest, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { v1 } from "../../api-versions"
import { k8ts } from "../../kind-map"
import { ManifestResource } from "../../node/manifest-resource"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Props {}
    const ident = v1.kind("Namespace")
    @k8ts(ident)
    @relations("none")
    @manifest({
        body(self): CDK.KubeNamespaceProps {
            return {
                spec: {}
            }
        }
    })
    export class Namespace extends ManifestResource<Props> {
        override kind = ident
        constructor(origin: Origin, meta: Meta | MutableMeta, props?: Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
