import type { Resource_Props_Top } from "@k8ts/instruments"
import type { Pod_Props } from "../../.."
import type { CDK } from "@k8ts/sample-interfaces"

export interface DaemonSet_UpdateStrategy_RollingUpdate extends CDK.RollingUpdateDaemonSet {
    type: "RollingUpdate"
}
export interface DaemonSet_UpdateStrategy_OnDelete {
    type: "OnDelete"
}
export type DaemonSet_UpdateStrategy =
    | DaemonSet_UpdateStrategy_RollingUpdate
    | DaemonSet_UpdateStrategy_OnDelete

export interface DaemonSet_Props<Ports extends string>
    extends Resource_Props_Top<CDK.DaemonSetSpec> {
    $template: Pod_Props<Ports>
    $updateStrategy?: DaemonSet_UpdateStrategy
}
