import { CDK } from "@k8ts/imports"
import {
    DataSourceRecord_Binary,
    DataSourceRecord_Text,
    LocalFileSource,
    manifest,
    ManifestResource,
    relations,
    resolveBinary,
    resolveText
} from "@k8ts/instruments"
import { toObject } from "@k8ts/metadata/util"
import { seq } from "doddle"
import { v1 } from "../../kinds/default"
export type ConfigMap = ConfigMap.ConfigMap
export namespace ConfigMap {
    export type ConfigMap_Entry_Source = LocalFileSource | string
    export interface ConfigMap_Props {
        data: DataSourceRecord_Text
        binaryData?: DataSourceRecord_Binary
    }

    @relations("none")
    @manifest({
        async body(self): Promise<CDK.KubeConfigMapProps> {
            const binaryData = await resolveBinary(self.props.binaryData ?? {})
            const data = await resolveText(self.props.data)
            const encodedBinaryData = seq(binaryData)
                .map(([k, x]) => [k, Buffer.from(x).toString("base64")] as const)
                .toRecord(x => x)
                .pull()
            return {
                data: data.size === 0 ? undefined : toObject(data),
                binaryData: binaryData.size === 0 ? undefined : encodedBinaryData
            }
        }
    })
    export class ConfigMap extends ManifestResource<ConfigMap_Props> {
        override kind = v1.ConfigMap._
    }
}
