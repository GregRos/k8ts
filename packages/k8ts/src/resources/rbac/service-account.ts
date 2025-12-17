import { CDK } from "@k8ts/imports"
import { manifest, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { k8ts } from "../../kind-map"
import { api2 } from "../../kinds"
import { ManifestResource } from "../../node/manifest-resource"

export type ServiceAccount = ServiceAccount.ServiceAccount
export namespace ServiceAccount {
    export interface ServiceAccount_Props {
        automountToken?: boolean
        imagePullSecrets?: string[]
    }

    @k8ts(api2.v1.ServiceAccount._)
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
        override kind = api2.v1.ServiceAccount._

        constructor(origin: Origin, meta: Meta | MutableMeta, props?: ServiceAccount_Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
