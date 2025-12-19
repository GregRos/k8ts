import { CDK } from "@k8ts/imports"
import { ManifestResource } from "@k8ts/instruments"
import { v1 } from "../../kinds/default"
export type ServiceAccount = ServiceAccount.ServiceAccount
export namespace ServiceAccount {
    export interface ServiceAccount_Props {
        automountToken?: boolean
        imagePullSecrets?: string[]
    }

    export class ServiceAccount extends ManifestResource<ServiceAccount_Props> {
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
}
