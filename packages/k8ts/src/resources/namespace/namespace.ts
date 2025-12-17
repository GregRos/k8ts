import { CDK } from "@k8ts/imports"
import { manifest, ManifestResource, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { v1 } from "../../kinds/default"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Namespace_Props {}

    @relations("none")
    @manifest({
        body(self): CDK.KubeNamespaceProps {
            return {
                spec: {}
            }
        }
    })
    export class Namespace extends ManifestResource<Namespace_Props> {
        override kind = v1.Namespace._
        constructor(origin: Origin, meta: Meta | MutableMeta, props?: Namespace_Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
