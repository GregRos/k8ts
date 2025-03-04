import type { CDK } from "@imports"
import { BaseNode } from "../../graph/base"
export interface ConfigMapProps {
    data: Record<string, string>
    name: string
}
export class ConfigMap extends BaseNode<ConfigMapProps> {
    override kind = "ConfigMap" as const

    override manifest(): CDK.KubeConfigMapProps {
        return {
            metadata: this.meta.expand(),
            data: this.props.data
        }
    }
}
