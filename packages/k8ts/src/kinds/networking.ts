import { group } from "@k8ts/instruments"

export namespace networking {
    export const _ = group("networking.k8s.io")
    export type _ = typeof _
    export namespace v1 {
        export const _ = networking._.version("v1")
        export type _ = typeof _
        export namespace NetworkPolicy {
            export const _ = v1._.kind("NetworkPolicy")
            export type _ = typeof _
        }
    }
}
