import type { CDK } from "@imports"
import type { Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { ManifestResource } from "../../node/base"
import { v1 } from "../api-version"
import { K8tsResources } from "../kind-map"
export type Namespace = Namespace.Namespace
export namespace Namespace {
    export interface Props {}
    @K8tsResources.register("Namespace")
    export class Namespace extends ManifestResource<Props> {
        override api = v1.kind("Namespace")
        constructor(origin: Origin, meta: Meta, props?: Props) {
            super(origin, meta, props ?? {})
        }
        override manifest(): CDK.KubeNamespaceProps {
            return {
                metadata: this.meta.expand(),
                spec: {}
            }
        }
    }
}
