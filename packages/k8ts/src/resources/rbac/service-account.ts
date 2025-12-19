import { CDK } from "@k8ts/imports"
import { ManifestResource } from "@k8ts/instruments"
import { v1 } from "../../kinds/default"
export interface ServiceAccount_Props {
    automountToken?: boolean
    imagePullSecrets?: string[]
}

export class ServiceAccount<Name extends string = string> extends ManifestResource<
    Name,
    ServiceAccount_Props
> {
    get kind() {
        return v1.ServiceAccount._
    }
    protected body(): CDK.KubeServiceAccountProps {
        const self = this
        return {
            automountServiceAccountToken: self.props.automountToken,
            imagePullSecrets: self.props.imagePullSecrets?.map(name => ({
                name
            }))
        }
    }
}
