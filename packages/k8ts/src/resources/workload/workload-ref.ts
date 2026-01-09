import type { PortExports, ResourceRef } from "@k8ts/instruments"

export type Workload_Ref<Ports extends string> = ResourceRef & {
    ports: PortExports<Ports>
}
