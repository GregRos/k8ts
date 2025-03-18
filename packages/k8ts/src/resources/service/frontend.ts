export namespace Frontend {
    export interface ClusterIp {
        type: "ClusterIP"
    }

    export interface LoadBalancer {
        type: "LoadBalancer"
        loadBalancerIP?: string
    }
}
export type Frontend = Frontend.ClusterIp | Frontend.LoadBalancer
