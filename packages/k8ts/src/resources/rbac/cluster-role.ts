import { CDK } from "@k8ts/imports"
import {
    Kind,
    manifest,
    ManifestResource,
    relations,
    type Origin,
    type Producer
} from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { seq } from "doddle"
import { rbac } from "../../kinds/rbac"
import { k8ts } from "../../world/kind-map"
export type ClusterRole = ClusterRole.ClusterRole
export namespace ClusterRole {
    export interface ClusterRole_Rule<
        Groups extends Kind.Group[] = Kind.Group[],
        Resources extends Kind.Kind<Groups[number]["name"], string, string>[] = Kind.Kind[]
    > {
        resources: Resources
        verbs: Verbs[]
    }
    export type ClusterRole_RuleProducer<Rules extends ClusterRole_Rule> = Producer<
        ClusterRole_Scope,
        Rules
    >
    class ClusterRole_Scope {
        Resources<const R extends Kind[]>(...resources: R) {
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
    @k8ts(rbac.v1.ClusterRole._)
    @relations("none")
    @manifest({
        _fromObject(self, rule: ClusterRole_Rule) {
            return {
                apiGroups: rule.resources.map(x => x.parent.parent.name),
                resources: rule.resources.map(r => r.plural),
                verbs: rule.verbs
            }
        },
        body(self): CDK.KubeClusterRoleProps {
            const rules = seq(self.props.rules(new ClusterRole_Scope()))
                .map(rule => {
                    return this._fromObject(self, rule)
                })
                .toArray()
                .pull()
            return {
                rules: rules
            }
        }
    })
    export class ClusterRole extends ManifestResource<ClusterRole_Props> {
        override kind = rbac.v1.ClusterRole._
        constructor(origin: Origin, meta: Meta | MutableMeta, props: ClusterRole_Props) {
            super(origin, meta.toMutable(), props)
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
}
