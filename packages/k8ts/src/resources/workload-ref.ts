import type { PortExports, ResourceRef } from "@k8ts/instruments"
import type { apps } from "../resource-idents"

export type Workload_Ref<Ports extends string> = ResourceRef<apps.v1.Deployment._> & {
    ports: PortExports<Ports>
}
