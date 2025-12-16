import { CDK } from "@k8ts/imports"
import { manifest, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { k8ts } from "../../kind-map"
import { api_ } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
import type { ClusterRole } from "./cluster-role"
import type { ServiceAccount } from "./service-account"

export type ClusterRoleBinding = ClusterRoleBinding.ClusterRoleBinding
export namespace ClusterRoleBinding {
    export interface ClusterRoleBoding_Props {
        $role: ClusterRole
        $subjects: ServiceAccount[]
    }

    @k8ts(api_.rbac_.v1_.ClusterRoleBinding)
    @relations({
        needs: self => ({
            role: self.props.$role,
            ...Object.fromEntries(self.props.$subjects.map((sa, i) => [`subject_${i}`, sa]))
        })
    })
    @equiv_cdk8s(CDK.KubeClusterRoleBinding)
    @manifest({
        body(self): CDK.KubeClusterRoleBindingProps {
            return {
                roleRef: {
                    apiGroup: "rbac.authorization.k8s.io",
                    kind: "ClusterRole",
                    name: self.props.$role.name
                },
                subjects: self.props.$subjects.map(sa => ({
                    kind: "ServiceAccount",
                    name: sa.name,
                    namespace: sa.namespace
                }))
            }
        }
    })
    export class ClusterRoleBinding extends ManifestResource<ClusterRoleBoding_Props> {
        override kind = api_.rbac_.v1_.ClusterRoleBinding

        constructor(origin: Origin, meta: Meta | MutableMeta, props: ClusterRoleBoding_Props) {
            super(origin, meta.toMutable(), props)
        }
    }
}
