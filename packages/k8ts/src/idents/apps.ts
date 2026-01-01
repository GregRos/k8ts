import { group } from "@k8ts/instruments"

export namespace apps {
    export const _ = group("apps")
    export type _ = typeof _
    export namespace v1 {
        export const _ = apps._.version("v1")
        export type _ = typeof _
        export namespace Deployment {
            export const _ = v1._.kind("Deployment")
            export type _ = typeof _
        }
        export namespace StatefulSet {
            export const _ = v1._.kind("StatefulSet")
            export type _ = typeof _
        }
        export namespace DaemonSet {
            export const _ = v1._.kind("DaemonSet")
            export type _ = typeof _
        }
        export namespace ReplicaSet {
            export const _ = v1._.kind("ReplicaSet")
            export type _ = typeof _
        }
        export namespace ControllerRevision {
            export const _ = v1._.kind("ControllerRevision")
            export type _ = typeof _
        }
    }
}
