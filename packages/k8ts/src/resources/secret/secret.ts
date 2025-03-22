import { manifest, relations } from "@k8ts/instruments"
import { CDK } from "../../_imports"
import { v1 } from "../../api-versions"
import { k8ts } from "../../kind-map"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"

export interface Props {
    data: Record<string, string>
    stringData: Record<string, string>
}

const ident = v1.kind("Secret")
@k8ts(ident)
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
    kind = ident
}
