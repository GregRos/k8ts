import { Rsc_Top } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../idents/default"
export interface ServiceAccount_Props {
    automountToken?: boolean
    imagePullSecrets?: string[]
}

export class ServiceAccount<Name extends string = string> extends Rsc_Top<
    Name,
    ServiceAccount_Props
> {
    get ident() {
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
