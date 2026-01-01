import { IdentKind, ResourceTop, type IdentGroup } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { rbac } from "../../idents/rbac"
export interface ClusterRole_Rule<
    Groups extends IdentGroup[] = IdentGroup[],
    Resources extends IdentKind<Groups[number]["name"], string, string>[] = IdentKind[]
> {
    resources: Resources
    verbs: Verbs[]
}
export type ClusterRole_RuleProducer<Rules extends ClusterRole_Rule> = (
    scope: ClusterRole_Scope
) => Iterable<Rules>
class ClusterRole_Scope {
    Rule<const R extends IdentKind[]>(...resources: R) {
        return {
            verbs(...verbs: Verbs[]) {
                return {
                    resources: resources,
                    verbs: verbs
                }
            }
        }
    }
}
export interface ClusterRole_Props<Rules extends ClusterRole_Rule = ClusterRole_Rule> {
    rules: ClusterRole_RuleProducer<Rules>
}

export class ClusterRole<Name extends string = string> extends ResourceTop<
    Name,
    ClusterRole_Props
> {
    get ident() {
        return rbac.v1.ClusterRole._
    }
    constructor(name: Name, props: ClusterRole_Props) {
        super(name, props)
    }

    private _fromObject(rule: ClusterRole_Rule) {
        return {
            apiGroups: Array.from(new Set(rule.resources.map(x => x.parent.parent.name))),
            resources: rule.resources.map(r => r.plural),
            verbs: rule.verbs
        }
    }
    protected body(): CDK.KubeClusterRoleProps {
        const rules = seq(this.props.rules(new ClusterRole_Scope()))
            .map(rule => {
                return this._fromObject(rule)
            })
            .toArray()
            .pull()
        return {
            rules: rules
        }
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

export type ApiGroup =
    | "namespaces"
    | "pods"
    | "services"
    | "endpoints"
    | "persistentvolumeclaims"
    | "events"
    | "configmaps"
    | "secrets"
    | "httproutes"
    | "gateways"
    | "jobs"
    | "cronjobs"
    | "deployments"
    | "replicasets"
    | "statefulsets"
    | "daemonsets"
    | "podtemplates"
    | "clusterroles"
    | "roles"
    | "rolebindings"
    | "clusterrolebindings"
    | "serviceaccounts"
    | "nodes"
    | "persistentvolumes"
    | "storageclasses"
    | "volumeattachments"
    | "persistentvolumeclaims"
