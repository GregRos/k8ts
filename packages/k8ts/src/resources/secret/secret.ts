import { v1 } from "../../api-versions"
import { ManifestResource } from "../../node/manifest-resource"
import { K8tsResources } from "../kind-map"

export interface Props {
    data: Record<string, string>
    stringData: Record<string, string>
}

@K8tsResources.register("Secret")
export class Secret extends ManifestResource<Props> {
    api = v1.kind("Secret")

    manifest() {
        return {
            metadata: this.meta.expand(),
            data: this.props.data,
            stringData: this.props.stringData
        }
    }
}
