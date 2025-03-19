import { manifest, relations } from "@k8ts/instruments"
import type { CDK } from "../../_imports"
import { v1 } from "../../api-versions"
import { k8ts } from "../../kind-map"
import { ManifestResource } from "../../node/manifest-resource"
export type ConfigMap = ConfigMap.ConfigMap
export namespace ConfigMap {
    export interface Props {
        data: Record<string, string>
        name: string
    }

    const ident = v1.kind("ConfigMap")
    @k8ts(ident)
    @relations("none")
    @manifest({
        body(self): CDK.KubeConfigMapProps {
            return {
                data: self.props.data
            }
        }
    })
    export class ConfigMap extends ManifestResource<Props> {
        override kind = ident
    }
}
