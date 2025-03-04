import type { KubeConfigMapProps } from "@imports"
import type { Meta } from "@k8ts/metadata/."
export interface ConfigMapProps {
    data: Record<string, string>
    name: string
}
export class ConfigMap {
    kind = "ConfigMap" as const
    constructor(
        readonly meta: Meta,
        readonly props: ConfigMapProps
    ) {}

    get name() {
        return this.meta.get("name")
    }
    manifest(): KubeConfigMapProps {
        return {
            metadata: this.meta.expand(),
            data: this.props.data
        }
    }
}
