import { CDK } from "@k8ts/imports"
import { manifest, ManifestResource, relations } from "@k8ts/instruments"
import { v1 } from "../../kinds/default"
import { k8ts } from "../../world/kind-map"

export interface Secret_Props {
    data?: Record<string, string>
    stringData?: Record<string, string>
}

@k8ts(v1.Secret._)
@relations("none")
@manifest({
    body(self): CDK.KubeSecretProps {
        return {
            data: self.props.data,
            stringData: self.props.stringData
        }
    }
})
export class Secret extends ManifestResource<Secret_Props> {
    readonly kind = v1.Secret._
}
