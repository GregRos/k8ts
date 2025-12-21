import { CDK } from "@k8ts/imports"
import {
    DataSourceRecord_Binary,
    DataSourceRecord_Text,
    DataSource_LocalFile,
    Resource_Top,
    resolveBinary,
    resolveText
} from "@k8ts/instruments"
import { toObject } from "@k8ts/metadata/util"
import { seq } from "doddle"
import { v1 } from "../../kinds/default"
export type ConfigMap_Entry_Source = DataSource_LocalFile | string
export interface ConfigMap_Props {
    data: DataSourceRecord_Text
    binaryData?: DataSourceRecord_Binary
}

export class ConfigMap<Name extends string = string> extends Resource_Top<Name, ConfigMap_Props> {
    get kind() {
        return v1.ConfigMap._
    }
    protected async body(): Promise<CDK.KubeConfigMapProps> {
        const self = this
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
}
