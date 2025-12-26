import type { Rsc_Ctor_Of } from "@k8ts/instruments"
import { World_Entity, type World_Props } from "./origins"
import {
    ClusterRole,
    ClusterRoleBinding,
    ConfigMap,
    CronJob,
    Deployment,
    HttpRoute,
    Namespace,
    Pv,
    Pvc,
    Secret,
    Service,
    ServiceAccount
} from "./resources"

// const defaultKinds = [
//     v1.Service._,
//     v1.ConfigMap._,
//     v1.Secret._,
//     v1.PersistentVolume._,
//     v1.PersistentVolumeClaim._,
//     v1.Namespace._,
//     v1.ServiceAccount._,
//     apps.v1.Deployment._,
//     //apps.v1.StatefulSet._,
//     //apps.v1.DaemonSet._,
//     //apps.v1.ReplicaSet._,
//     //apps.v1.ControllerRevision._,
//     storage.v1.StorageClass._,
//     //storage.v1.VolumeAttachment._,
//     batch.v1.CronJob._,
//     batch.v1.Job._,
//     gateway.v1.Gateway._,
//     //gateway.v1.GatewayClass._,
//     gateway.v1.HttpRoute._,
//     // gateway.v1.TlsRoute._,
//     // gateway.v1.TcpRoute._,
//     // metrics.v1beta1.NodeMetrics._,
//     // metrics.v1beta1.PodMetrics._,
//     //rbac.v1.Role._,
//     //rbac.v1.RoleBinding._,
//     rbac.v1.ClusterRole._,
//     rbac.v1.ClusterRoleBinding._
//     //networking.v1.NetworkPolicy._
// ] as const

const defaultKindPairs = [
    Service,
    Deployment,
    ConfigMap,
    Secret,
    Pv,
    Pvc,
    Namespace,
    CronJob,
    ServiceAccount,
    ClusterRole,
    HttpRoute,
    ClusterRoleBinding
] as const

export class World<MoreKinds extends Rsc_Ctor_Of[] = []> extends World_Entity<
    [...typeof defaultKindPairs, ...MoreKinds]
> {
    constructor(name: string, props?: World_Props<[...typeof defaultKindPairs, ...MoreKinds]>) {
        props ??= {}
        props.kinds ??= []
        props.kinds.push(...(defaultKindPairs as any))
        super(name, props)
    }
}
