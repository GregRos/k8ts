import type { CDK } from "@imports"
import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node/base"
import { K8tsResources } from "../kind-map"
export type ConfigMap = ConfigMap.ConfigMap
export namespace ConfigMap {
    export interface Props {
        data: Record<string, string>
        name: string
    }

    @K8tsResources.register("ConfigMap")
    export class ConfigMap extends ManifestResource<Props> {
        override api = v1.kind("ConfigMap")

        override manifest(): CDK.KubeConfigMapProps {
            return {
                metadata: this.meta.expand(),
                data: this.props.data
            }
        }
    }
}
