import type { Resource_Props_Top } from "@k8ts/instruments"
import type { K8S } from "@k8ts/sample-interfaces"
import type { Pod_Props } from "../../.."

export interface DaemonSet_UpdateStrategy_RollingUpdate extends K8S.RollingUpdateDaemonSet {
    type: "RollingUpdate"
}
export interface DaemonSet_UpdateStrategy_OnDelete {
    type: "OnDelete"
}
export type DaemonSet_UpdateStrategy =
    | DaemonSet_UpdateStrategy_RollingUpdate
    | DaemonSet_UpdateStrategy_OnDelete

export interface DaemonSet_Props<Ports extends string>
    extends Resource_Props_Top<K8S.DaemonSetSpec> {
    $template: Pod_Props<Ports>
    $updateStrategy?: DaemonSet_UpdateStrategy
}
