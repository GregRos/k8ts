import { K8sResource, type Resource_Props_Top } from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../gvks/default"
export interface ServiceAccount_Props extends Resource_Props_Top<K8S.KubeServiceAccountProps> {
    $automountToken?: boolean
    $imagePullSecrets?: string[]
}

export class ServiceAccount<Name extends string = string> extends K8sResource<
    Name,
    ServiceAccount_Props
> {
    get kind() {
        return v1.ServiceAccount._
    }
    protected __body__(): K8S.KubeServiceAccountProps {
        const self = this
        const body = {
            automountServiceAccountToken: self.props.$automountToken,
            imagePullSecrets: self.props.$imagePullSecrets?.map(name => ({
                name
            }))
        } satisfies K8S.KubeServiceAccountProps
        return merge(body, self.props.$overrides)
    }
}
