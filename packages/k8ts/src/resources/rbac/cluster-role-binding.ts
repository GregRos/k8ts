import { ResourceTop, type Resource_Props_Top } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { rbac } from "../../gvks/rbac"
import type { ClusterRole } from "./cluster-role"
import type { ServiceAccount } from "./service-account"

export interface ClusterRoleBoding_Props
    extends Resource_Props_Top<CDK.KubeClusterRoleBindingProps> {
    $role: ClusterRole
    $subjects: ServiceAccount[]
}

export class ClusterRoleBinding<Name extends string = string> extends ResourceTop<
    Name,
    ClusterRoleBoding_Props
> {
    get kind() {
        return rbac.v1.ClusterRoleBinding._
    }

    protected __needs__() {
        return {
            role: this.props.$role,
            subjects: this.props.$subjects
        }
    }
    protected __body__(): CDK.KubeClusterRoleBindingProps {
        const body = {
            roleRef: {
                apiGroup: this.props.$role.kind.parent!.parent!.url,
                kind: this.props.$role.kind.value,
                name: this.props.$role.ident.name
            },
            subjects: this.props.$subjects.map(sa => ({
                kind: sa.kind.value,
                name: sa.ident.name,
                namespace: sa.ident.namespace!
            }))
        }
        return merge(body, this.props.$overrides)
    }
}
