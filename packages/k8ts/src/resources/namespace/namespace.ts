import type { CDK } from "@imports"
import type { Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { Base } from "../../node/base"
import { v1 } from "../api-version"
import { K8tsResources } from "../kind-map"

export interface Props {}
@K8tsResources.register("Namespace")
export class Namespace extends Base<Props> {
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
