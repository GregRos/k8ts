import { ResourceTop, type Resource_Props } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../resource-idents/default"
export interface ServiceAccount_Props extends Resource_Props<CDK.KubeServiceAccountProps> {
    $automountToken?: boolean
    $imagePullSecrets?: string[]
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
        const body = {
            automountServiceAccountToken: self.props.$automountToken,
            imagePullSecrets: self.props.$imagePullSecrets?.map(name => ({
                name
            }))
        } satisfies CDK.KubeServiceAccountProps
        return merge(body, self.props.$overrides)
    }
}
