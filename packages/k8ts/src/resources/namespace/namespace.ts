import type { CDK } from "@imports"
import { connections, manifest, type Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node/manifest-resource"
import { k8ts } from "../kind-map"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Props {}
    const ident = v1.kind("Namespace")
    @k8ts(ident)
    @connections("none")
    @manifest({
        body(self): CDK.KubeNamespaceProps {
            return {
                spec: {}
            }
        }
    })
    export class Namespace extends ManifestResource<Props> {
        override kind = ident
        constructor(origin: Origin, meta: Meta, props?: Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
