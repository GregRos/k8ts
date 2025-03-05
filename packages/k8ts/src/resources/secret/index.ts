import { Base } from "../../node/base"
import { v1 } from "../api-version"
import { K8tsResources } from "../kind-map"

export interface SecretProps {
    data: Record<string, string>
    stringData: Record<string, string>
}

@K8tsResources.register("Secret")
export class Secret extends Base<SecretProps> {
    api = v1.kind("Secret")

    manifest() {
        return {
            metadata: this.meta.expand(),
            data: this.props.data,
            stringData: this.props.stringData
        }
    }
}
