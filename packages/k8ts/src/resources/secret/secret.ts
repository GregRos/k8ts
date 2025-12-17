import { CDK } from "@k8ts/imports"
import { manifest, relations } from "@k8ts/instruments"
import { k8ts } from "../../kind-map"
import { api2 } from "../../kinds"
import { ManifestResource } from "../../node/manifest-resource"

export interface Secret_Props {
    data?: Record<string, string>
    stringData?: Record<string, string>
}

@k8ts(api2.v1.Secret._)
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
    readonly kind = api2.v1.Secret._
}
