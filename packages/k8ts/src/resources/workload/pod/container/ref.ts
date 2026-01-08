import type { ResourceRef } from "@k8ts/instruments"
import type { v1 } from "../../../../gvks"

export type ContainerRef<Ports extends string> = ResourceRef<v1.Pod.Container._> & {
    __PORTS__: Ports
}
