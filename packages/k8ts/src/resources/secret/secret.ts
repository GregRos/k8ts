import { Base } from "../../graph/base"
import { K8tsResources } from "../kind-map"

export interface SecretProps {
    data: Record<string, string>
    stringData: Record<string, string>
}

@K8tsResources.register("Secret")
export class Secret extends Base<SecretProps> {
    kind = "Secret" as const

    manifest() {
        return {
            metadata: this.meta.expand(),
            data: this.props.data,
            stringData: this.props.stringData
        }
    }
}
