import { CDK } from "@k8ts/imports"
import { manifest, ManifestResource, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { k8ts } from "../../kind-map"
import { api2 } from "../../kinds"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Namespace_Props {}
    @k8ts(api2.v1.Namespace._)
    @relations("none")
    @manifest({
        body(self): CDK.KubeNamespaceProps {
            return {
                spec: {}
            }
        }
    })
    export class Namespace extends ManifestResource<Namespace_Props> {
        override kind = api2.v1.Namespace._
        constructor(origin: Origin, meta: Meta | MutableMeta, props?: Namespace_Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
