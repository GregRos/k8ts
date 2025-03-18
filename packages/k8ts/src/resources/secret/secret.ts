import { CDK } from "@imports"
import { manifest, relations } from "@k8ts/instruments"
import { v1 } from "../../api-versions"
import { k8ts } from "../../kind-map"
import { ManifestResource } from "../../node/manifest-resource"

export interface Props {
    data: Record<string, string>
    stringData: Record<string, string>
}

const ident = v1.kind("Secret")
@k8ts(ident)
@relations("none")
@manifest({
    body(self): CDK.KubeSecretProps {
        return {
            data: self.props.data,
            stringData: self.props.stringData
        }
    }
})
export class Secret extends ManifestResource<Props> {
    kind = ident
}
