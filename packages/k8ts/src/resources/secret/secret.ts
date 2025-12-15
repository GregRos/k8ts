import { CDK } from "@k8ts/imports"
import { manifest, relations } from "@k8ts/instruments"
import { k8ts } from "../../kind-map"
import { api_ } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"

export interface Props {
    data?: Record<string, string>
    stringData?: Record<string, string>
}

@k8ts(api_.v1_.Secret)
@equiv_cdk8s(CDK.KubeSecret)
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
    readonly kind = api_.v1_.Secret
}
