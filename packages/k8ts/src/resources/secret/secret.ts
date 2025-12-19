import { ManifestResource } from "@k8ts/instruments"
import { v1 } from "../../kinds/default"

export interface Secret_Props {
    data?: Record<string, string>
    stringData?: Record<string, string>
}

export class Secret extends ManifestResource<Secret_Props> {
    get kind() {
        return v1.Secret._
    }

    protected body() {
        return {
            data: this.props.data,
            stringData: this.props.stringData
        }
    }
}
