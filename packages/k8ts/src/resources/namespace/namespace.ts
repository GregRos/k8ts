import type { CDK } from "@imports"
import type { Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node/manifest-resource"
import { K8tsResources } from "../kind-map"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Props {}
    @K8tsResources.register("Namespace")
    export class Namespace extends ManifestResource<Props> {
        override api = v1.kind("Namespace")
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
