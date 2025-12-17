import { CDK } from "@k8ts/imports"
import { manifest, ManifestResource, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { v1 } from "../../kinds/default"

export type ServiceAccount = ServiceAccount.ServiceAccount
export namespace ServiceAccount {
    export interface ServiceAccount_Props {
        automountToken?: boolean
        imagePullSecrets?: string[]
    }

    @relations("none")
    @manifest({
        body(self): CDK.KubeServiceAccountProps {
            return {
                automountServiceAccountToken: self.props.automountToken,
                imagePullSecrets: self.props.imagePullSecrets?.map(name => ({ name }))
            }
        }
    })
    export class ServiceAccount extends ManifestResource<ServiceAccount_Props> {
        override kind = v1.ServiceAccount._

        constructor(origin: Origin, meta: Meta | MutableMeta, props?: ServiceAccount_Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
