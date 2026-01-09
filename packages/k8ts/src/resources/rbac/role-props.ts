import type { Gvk, Resource_Props_Top } from "@k8ts/instruments"
import type { Verbs } from "./cluster-role"
import type { CDK } from "@k8ts/sample-interfaces"
export interface ClusterRole_Rule<Resources extends Gvk[] = Gvk[]> {
    resources: Resources
    verbs: Verbs[]
}
export type ClusterRole_RuleProducer<Rules extends ClusterRole_Rule> = (
    scope: ClusterRole_Scope
) => Iterable<Rules>
export class ClusterRole_Scope {
    Rule<const R extends Gvk[]>(...resources: R) {
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
export interface ClusterRole_Props<Rules extends ClusterRole_Rule = ClusterRole_Rule>
    extends Resource_Props_Top<CDK.KubeClusterRoleProps> {
    rules: ClusterRole_RuleProducer<Rules>
}
