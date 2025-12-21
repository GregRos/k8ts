import { CDK } from "@k8ts/imports"
import { Resource_Top } from "@k8ts/instruments"
import { rbac } from "../../kinds/rbac"
import type { ClusterRole } from "./cluster-role"
import type { ServiceAccount } from "./service-account"

export interface ClusterRoleBoding_Props {
    $role: ClusterRole
    $subjects: ServiceAccount[]
}

export class ClusterRoleBinding<Name extends string = string> extends Resource_Top<
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
    protected body(): CDK.KubeClusterRoleBindingProps {
        return {
            roleRef: {
                apiGroup: this.props.$role.kind.parent!.text,
                kind: this.props.$role.kind.name,
                name: this.props.$role.name
            },
            subjects: this.props.$subjects.map(sa => ({
                kind: sa.kind.name,
                name: sa.name,
                namespace: sa.namespace!
            }))
        }
    }
}
