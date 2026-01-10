import type { Metadata_Input } from "@k8ts/metadata"
import type { OriginEntity } from "../origin"

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends { kind: any }
        ? T[P]
        : T[P] extends object
          ? DeepPartial<T[P]>
          : T[P]
}

export interface ResourceTop_CreationOptions_Origins {
    /** The Resource's Origin. */
    own: OriginEntity
    /** The Origin to be used by top resources created within a subscope of this Resource. */
    subscope: OriginEntity
}
export interface ResourceTop_CreationOptions {
    /** Specifies explicit Origins to use for this Resource. */
    origins: ResourceTop_CreationOptions_Origins
}

export interface ResourceTop_CreationOptions_Input
    extends DeepPartial<ResourceTop_CreationOptions> {
    /** Extra metadata to apply to the Resource. */
    metadata?: Metadata_Input
}
