import type { CDK } from "@imports"
import { Base } from "../../node/base"
import { v1 } from "../api-version"
import { K8tsResources } from "../kind-map"
export interface ConfigMapProps {
    data: Record<string, string>
    name: string
}
@K8tsResources.register("ConfigMap")
export class ConfigMap extends Base<ConfigMapProps> {
    override api = v1.kind("ConfigMap")

    override manifest(): CDK.KubeConfigMapProps {
        return {
            metadata: this.meta.expand(),
            data: this.props.data
        }
    }
}
