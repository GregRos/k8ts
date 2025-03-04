import { Base } from "../../graph/base"

export interface SecretProps {
    data: Record<string, string>
    stringData: Record<string, string>
}

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
