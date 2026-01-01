import { Rsc_Top } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { rbac } from "../../idents/rbac"
import type { ClusterRole } from "./cluster-role"
import type { ServiceAccount } from "./service-account"

export interface ClusterRoleBoding_Props {
    $role: ClusterRole
    $subjects: ServiceAccount[]
}

export class ClusterRoleBinding<Name extends string = string> extends Rsc_Top<
    Name,
    ClusterRoleBoding_Props
> {
    get ident() {
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
                apiGroup: this.props.$role.ident.parent!.parent!.text,
                kind: this.props.$role.ident.name,
                name: this.props.$role.name
            },
            subjects: this.props.$subjects.map(sa => ({
                kind: sa.ident.name,
                name: sa.name,
                namespace: sa.namespace!
            }))
        }
    }
}
