import type { Resource_Props_Top } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import type { Pod_Props, Service_Props } from "../../.."
import type { ContainerRef } from "../pod/container"
import type { StatefulSet_Scope } from "./scope"

export interface StatefulSet_UpdateStrategy_RollingUpdate
    extends CDK.RollingUpdateStatefulSetStrategy {
    type: "RollingUpdate"
}
export interface StatefulSet_UpdateStrategy_OnDelete {
    type: "OnDelete"
}
export type StatefulSet_UpdateStrategy =
    | StatefulSet_UpdateStrategy_RollingUpdate
    | StatefulSet_UpdateStrategy_OnDelete

export type StatefulSet_Producer<Ports extends string> = (
    scope: StatefulSet_Scope
) => Iterable<ContainerRef<Ports>>
export interface StatefulSet_Props<
    Ports extends string,
    SvcPorts extends NoInfer<Ports>,
    SvcName extends string
> extends Resource_Props_Top<CDK.StatefulSetSpec> {
    $replicas?: number
    $template: Omit<Pod_Props<Ports>, "containers$"> & {
        containers$: StatefulSet_Producer<Ports>
    }
    $service: {
        name: SvcName
    } & Omit<Service_Props<Ports, SvcPorts>, "$backend" | "$frontend">
    $updateStrategy?: StatefulSet_UpdateStrategy
}
