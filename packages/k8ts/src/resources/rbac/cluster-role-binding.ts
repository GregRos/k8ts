import { CDK } from "@k8ts/imports"
import { manifest, relations, type Origin } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { k8ts } from "../../kind-map"
import { api2 } from "../../kinds"
import { ManifestResource } from "../../node/manifest-resource"
import type { ClusterRole } from "./cluster-role"
import type { ServiceAccount } from "./service-account"

export type ClusterRoleBinding = ClusterRoleBinding.ClusterRoleBinding
export namespace ClusterRoleBinding {
    export interface ClusterRoleBoding_Props {
        $role: ClusterRole
        $subjects: ServiceAccount[]
    }

    @k8ts(api2["rbac.authorization.k8s.io"].v1.ClusterRoleBinding._)
    @relations({
        needs: self => ({
            role: self.props.$role,
            subjects: self.props.$subjects
        })
    })
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
        override kind = api2["rbac.authorization.k8s.io"].v1.ClusterRoleBinding._

        constructor(origin: Origin, meta: Meta | MutableMeta, props: ClusterRoleBoding_Props) {
            super(origin, meta.toMutable(), props)
        }
    }
}
