import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node/manifest-resource"
import { K8tsResources } from "../kind-map"

export interface Props {
    data: Record<string, string>
    stringData: Record<string, string>
}

const ident = v1.kind("Secret")
@K8tsResources.register(ident)
export class Secret extends ManifestResource<Props> {
    api = ident

    manifestBody() {
        return {
            metadata: this.metadata(),
            data: this.props.data,
            stringData: this.props.stringData
        }
    }
}
