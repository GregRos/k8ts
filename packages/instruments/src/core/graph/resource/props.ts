import type { Metadata_Input } from "@k8ts/metadata"

export interface Resource_Props<ResultType extends object = object> {
    $overrides?: ResultType
    $noEmit?: boolean
}

export interface Resource_Props_Top<ResultType extends object = object>
    extends Resource_Props<ResultType> {
    $metadata?: Metadata_Input
}
