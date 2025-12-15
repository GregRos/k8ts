import { Kind, manifest, relations, type Origin, type Producer } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { seq } from "doddle"
import { CDK } from "../../_imports"
import { k8ts } from "../../kind-map"
import { api_ } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
export type ClusterRole = ClusterRole.ClusterRole
export namespace ClusterRole {
    export interface RoleRule<
        Groups extends Kind.Group[] = Kind.Group[],
        Resources extends Kind.Kind<string, Kind.Version<string, Groups[number]>>[] = Kind.Kind[]
    > {
        resources: Resources
        verbs: Verbs[]
    }
    export type ApiGroupProducer<Rules extends RoleRule> = Producer<ClusterRoleScope, Rules>
    class ClusterRoleScope {
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
    export interface Props<Rules extends RoleRule = RoleRule> {
        rules: ApiGroupProducer<Rules>
    }
    @k8ts(api_.rbac_.v1_.ClusterRole)
    @relations("none")
    @equiv_cdk8s(CDK.KubeClusterRole)
    @manifest({
        _fromObject(self, rule: RoleRule) {
            return {
                apiGroups: rule.resources.map(x => x.parent.parent.name),
                resources: rule.resources.map(r => r.plural),
                verbs: rule.verbs
            }
        },
        body(self): CDK.KubeClusterRoleProps {
            const rules = seq(self.props.rules(new ClusterRoleScope()))
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
    export class ClusterRole extends ManifestResource<Props> {
        override kind = api_.rbac_.v1_.ClusterRole
        constructor(origin: Origin, meta: Meta | MutableMeta, props: Props) {
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
