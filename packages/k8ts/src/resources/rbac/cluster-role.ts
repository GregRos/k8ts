import { K8sResource } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { merge } from "lodash"
import { rbac } from "../../gvks/rbac"
import { type ClusterRole_Props, type ClusterRole_Rule, ClusterRole_Scope } from "./role-props"
export class ClusterRole<Name extends string = string> extends K8sResource<
    Name,
    ClusterRole_Props
> {
    get kind() {
        return rbac.v1.ClusterRole._
    }
    constructor(name: Name, props: ClusterRole_Props) {
        super(name, props)
    }

    private _fromObject(rule: ClusterRole_Rule) {
        return {
            apiGroups: Array.from(new Set(rule.resources.map(x => x.parent.parent.value))),
            resources: rule.resources.map(r => r.plural),
            verbs: rule.verbs
        }
    }
    protected __body__(): CDK.KubeClusterRoleProps {
        const rules = seq(this.props.rules$(new ClusterRole_Scope()))
            .map(rule => {
                return this._fromObject(rule)
            })
            .toArray()
            .pull()
        const body = {
            rules: rules
        }
        return merge(body, this.props.$overrides)
    }
}

export type Verbs =
    | "get"
    | "list"
    | "watch"
    | "create"
    | "update"
    | "patch"
    | "delete"
    | "deletecollection"
