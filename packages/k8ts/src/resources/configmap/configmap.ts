import {
    DataSourceRecord_Binary,
    DataSourceRecord_Text,
    LocalFileSource,
    manifest,
    relations,
    resolveBinary,
    resolveText
} from "@k8ts/instruments"
import { CDK } from "../../_imports"
import { k8ts } from "../../kind-map"
import { api } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
export type ConfigMap = ConfigMap.ConfigMap
export namespace ConfigMap {
    export type ConfigMapEntrySource = LocalFileSource | string
    export interface Props {
        data: DataSourceRecord_Text
        binaryData?: DataSourceRecord_Binary
    }

    @k8ts(api.v1_.ConfigMap)
    @relations("none")
    @equiv_cdk8s(CDK.KubeConfigMap)
    @manifest({
        async body(self): Promise<CDK.KubeConfigMapProps> {
            const binaryData = await resolveBinary(self.props.binaryData ?? {})
            const data = await resolveText(self.props.data)
            return {
                data: data.isEmpty() ? undefined : data.toObject(),
                binaryData: binaryData.isEmpty()
                    ? undefined
                    : binaryData.map(x => Buffer.from(x).toString("base64")).toObject()
            }
        }
    })
    export class ConfigMap extends ManifestResource<Props> {
        override kind = api.v1_.ConfigMap
    }
}
