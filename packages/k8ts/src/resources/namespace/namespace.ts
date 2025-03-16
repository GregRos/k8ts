import type { CDK } from "@imports"
import type { Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node/manifest-resource"
import { K8tsResources } from "../kind-map"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Props {}
    const ident = v1.kind("Namespace")
    @K8tsResources.register(ident)
    export class Namespace extends ManifestResource<Props> {
        override kind = ident
        constructor(origin: Origin, meta: Meta, props?: Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
        override manifestBody(): CDK.KubeNamespaceProps {
            return {
                metadata: this.metadata(),
                spec: {}
            }
        }
    }
}
