import { K8sResource, type Resource_Props_Top, type ResourceRef } from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import type { v1 } from "../../gvks"
import { rbac } from "../../gvks/rbac"

export interface ClusterRoleBoding_Props
    extends Resource_Props_Top<K8S.KubeClusterRoleBindingProps> {
    $role: ResourceRef<rbac.v1.ClusterRole._>
    $subjects: ResourceRef<v1.ServiceAccount._>[]
}

export class ClusterRoleBinding<Name extends string = string> extends K8sResource<
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
    protected __body__(): K8S.KubeClusterRoleBindingProps {
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
        return merge(body, this.props.$$manifest)
    }
}
