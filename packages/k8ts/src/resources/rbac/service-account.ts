import { manifest, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { CDK } from "../../_imports"
import { k8ts } from "../../kind-map"
import { api_ } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"

export type ServiceAccount = ServiceAccount.ServiceAccount
export namespace ServiceAccount {
    export interface Props {
        automountToken?: boolean
        imagePullSecrets?: string[]
    }

    @k8ts(api_.v1_.ServiceAccount)
    @relations("none")
    @equiv_cdk8s(CDK.KubeServiceAccount)
    @manifest({
        body(self): CDK.KubeServiceAccountProps {
            return {
                automountServiceAccountToken: self.props.automountToken,
                imagePullSecrets: self.props.imagePullSecrets?.map(name => ({ name }))
            }
        }
    })
    export class ServiceAccount extends ManifestResource<Props> {
        override kind = api_.v1_.ServiceAccount

        constructor(origin: Origin, meta: Meta | MutableMeta, props?: Props) {
            super(origin, meta.toMutable(), props ?? {})
        }
    }
}
