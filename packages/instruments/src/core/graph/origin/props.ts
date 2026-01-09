import type { Metadata_Input } from "@k8ts/metadata"
import type { ResourceRef_Constructor } from "../resource"
import type { GvkClassDict_Input } from "./kind-map"

export interface Origin_Props<
    KindedCtors extends ResourceRef_Constructor = ResourceRef_Constructor
> {
    noEmit?: boolean
    metadata?: Metadata_Input
    kinds?: GvkClassDict_Input<KindedCtors>
}
