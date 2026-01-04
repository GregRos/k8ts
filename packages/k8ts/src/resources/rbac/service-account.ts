import { ResourceTop } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../idents/default"
export interface ServiceAccount_Props {
    automountToken?: boolean
    imagePullSecrets?: string[]
}

export class ServiceAccount<Name extends string = string> extends ResourceTop<
    Name,
    ServiceAccount_Props
> {
    get ident() {
        return v1.ServiceAccount._
    }
    protected __body__(): CDK.KubeServiceAccountProps {
        const self = this
        return {
            automountServiceAccountToken: self.props.automountToken,
            imagePullSecrets: self.props.imagePullSecrets?.map(name => ({
                name
            }))
        }
    }
}
