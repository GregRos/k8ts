export namespace Frontend {
    export interface ClusterIp {
        type: "ClusterIp"
    }

    export interface LoadBalancer {
        type: "LoadBalancer"
        loadBalancerIP?: string
    }
}
export type Frontend = Frontend.ClusterIp | Frontend.LoadBalancer
