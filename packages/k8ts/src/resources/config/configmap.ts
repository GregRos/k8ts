import { Rsc_Top, type DataSource } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../kinds/default"
import { resolveDataSourceRecord } from "./resolver"
export interface ConfigMap_Props<Keys extends string = string> {
    $data: Record<Keys, DataSource>
}

export class ConfigMap<Name extends string = string, Keys extends string = string> extends Rsc_Top<
    Name,
    ConfigMap_Props<Keys>
> {
    get keys(): Keys[] {
        return Object.keys(this.props.$data) as Keys[]
    }
    get kind() {
        return v1.ConfigMap._
    }

    protected async body(): Promise<CDK.KubeConfigMapProps> {
        const resolvedRecord = await resolveDataSourceRecord(this, this.props.$data)
        return resolvedRecord
    }
}
