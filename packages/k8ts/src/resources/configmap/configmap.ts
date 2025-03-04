import type { CDK } from "@imports"
import { Base } from "../../graph/base"
export interface ConfigMapProps {
    data: Record<string, string>
    name: string
}
export class ConfigMap extends Base<ConfigMapProps> {
    override kind = "ConfigMap" as const

    override manifest(): CDK.KubeConfigMapProps {
        return {
            metadata: this.meta.expand(),
            data: this.props.data
        }
    }
}
