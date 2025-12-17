import { Kind } from "@k8ts/instruments"

export namespace batch {
    export const _ = Kind.group("batch")
    export type _ = typeof _
    export namespace v1 {
        export const _ = batch._.version("v1")
        export type _ = typeof _
        export namespace Job {
            export const _ = v1._.kind("Job")
            export type _ = typeof _
        }
        export namespace CronJob {
            export const _ = v1._.kind("CronJob")
            export type _ = typeof _
        }
    }
}
