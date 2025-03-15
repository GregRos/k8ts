import type { CDK } from "@imports"
import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node/manifest-resource"
import { K8tsResources } from "../kind-map"
export type ConfigMap = ConfigMap.ConfigMap
export namespace ConfigMap {
    export interface Props {
        data: Record<string, string>
        name: string
    }

    const ident = v1.kind("ConfigMap")
    @K8tsResources.register(ident)
    export class ConfigMap extends ManifestResource<Props> {
        override api = ident

        override manifestBody(): CDK.KubeConfigMapProps {
            return {
                metadata: this.metadata(),
                data: this.props.data
            }
        }
    }
}
