import { Kind } from "@k8ts/instruments"

export namespace storage {
    export const _ = Kind.group("storage.k8s.io")
    export type _ = typeof _
    export namespace v1 {
        export const _ = storage._.version("v1")
        export type _ = typeof _
        export namespace StorageClass {
            export const _ = v1._.kind("StorageClass")
            export type _ = typeof _
        }
        export namespace VolumeAttachment {
            export const _ = v1._.kind("VolumeAttachment")
            export type _ = typeof _
        }
    }
}
