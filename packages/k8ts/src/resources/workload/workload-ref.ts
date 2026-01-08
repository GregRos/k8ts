import type { PortExports, ResourceRef } from "@k8ts/instruments"
import type { Metadata } from "@k8ts/metadata"

export type Workload_Ref<Ports extends string> = ResourceRef & {
    ports: PortExports<Ports>
    selectorLabels: Metadata
}
