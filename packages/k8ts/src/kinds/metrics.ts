import { group } from "@k8ts/instruments"

export namespace metrics {
    export const _ = group("metrics.k8s.io")
    export type _ = typeof _
    export namespace v1beta1 {
        export const _ = metrics._.version("v1beta1")
        export type _ = typeof _
        export namespace NodeMetrics {
            export const _ = v1beta1._.kind("NodeMetrics", "nodes")
            export type _ = typeof _
        }
        export namespace PodMetrics {
            export const _ = v1beta1._.kind("PodMetrics", "pods")
            export type _ = typeof _
        }
    }
}
