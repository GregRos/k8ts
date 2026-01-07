import { ResourceTop, type DataSource, type Resource_Props_Top } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../gvks/default"
import { resolveDataSourceRecord } from "./resolver"
export interface ConfigMap_Props<Keys extends string = string> extends Resource_Props_Top {
    $data: Record<Keys, DataSource>
}

export class ConfigMap<
    Name extends string = string,
    Keys extends string = string
> extends ResourceTop<Name, ConfigMap_Props<Keys>> {
    get keys(): Keys[] {
        return Object.keys(this.props.$data) as Keys[]
    }
    get kind() {
        return v1.ConfigMap._
    }

    protected async __body__(): Promise<CDK.KubeConfigMapProps> {
        const resolvedRecord = await resolveDataSourceRecord(this, this.props.$data)
        return merge(resolvedRecord, this.props.$overrides)
    }
}
