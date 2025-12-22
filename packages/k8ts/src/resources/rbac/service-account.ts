import { Resource_Top } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../kinds/default"
export interface ServiceAccount_Props {
    automountToken?: boolean
    imagePullSecrets?: string[]
}

export class ServiceAccount<Name extends string = string> extends Resource_Top<
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
