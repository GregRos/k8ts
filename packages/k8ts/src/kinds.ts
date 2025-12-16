import { From_Groups, Kind } from "@k8ts/instruments"

export const api2 = From_Groups({
    "": {
        v1: {
            Pod: {
                Container: {
                    Port: {},
                    EnvVar: {},
                    VolumeMount: {},
                    DeviceMount: {}
                },
                Volume: {
                    Device: {}
                }
            },
            ConfigMap: {},
            Secret: {},
            Service: {},
            Node: {},
            Namespace: {},
            ServiceAccount: {},
            PersistentVolume: {},
            PersistentVolumeClaim: {},
            PodTemplate: {}
        }
    },

    apps: {
        v1: {
            Deployment: {},
            StatefulSet: {},
            DaemonSet: {},
            ReplicaSet: {},
            ControllerRevision: {}
        }
    },
    batch: {
        v1: {
            Job: {},
            CronJob: {}
        }
    },
    "rbac.authorization.k8s.io": {
        v1: {
            Role: {},
            ClusterRole: {},
            RoleBinding: {},
            ClusterRoleBinding: {}
        }
    },
    "networking.k8s.io": {
        v1: {
            NetworkPolicy: {}
        }
    },
    "gateway.networking.k8s.io": {
        v1: {
            Gateway: {},
            GatewayClass: {},
            HTTPRoute: {},
            TCPRoute: {},
            TLSRoute: {}
        }
    },
    "storage.k8s.io": {
        v1: {
            StorageClass: {},
            VolumeAttachment: {}
        }
    },
    "metrics.k8s.io": {
        v1beta1: {
            NodeMetrics: {},
            PodMetrics: {}
        }
    }
})
export namespace api_ {
    export const v1 = Kind.version("v1")
    export type v1 = typeof v1

    export const batch = Kind.group("batch")
    export type batch = typeof batch
    export namespace batch_ {
        export const v1 = batch.version("v1")
        export namespace v1_ {
            export const Job = v1.kind("Job")
            export type Job = typeof Job

            export const CronJob = v1.kind("CronJob")
            export type CronJob = typeof CronJob
        }
    }

    export namespace v1_ {
        export const ConfigMap = v1.kind("ConfigMap")
        export type ConfigMap = typeof ConfigMap

        export const Secret = v1.kind("Secret")
        export type Secret = typeof Secret

        export const Service = v1.kind("Service")
        export type Service = typeof Service

        export const Pod = v1.kind("Pod")
        export type Pod = typeof Pod

        export namespace Pod_ {
            export const Container = Pod.subkind("Container")
            export type Container = typeof Container

            export const Port = Container.subkind("Port")
            export type Port = typeof Port

            export const EnvVar = Container.subkind("EnvVar")
            export type EnvVar = typeof EnvVar

            export const VolumeMount = Container.subkind("VolumeMount")
            export type VolumeMount = typeof VolumeMount

            export const DeviceMount = Container.subkind("DeviceMount")
            export type DeviceMount = typeof DeviceMount

            export const Volume = Pod.subkind("Volume")
            export type Volume = typeof Volume

            export const Device = Volume.subkind("Device")
            export type Device = typeof Device
        }

        export const Node = v1.kind("Node")
        export type Node = typeof Node

        export const Namespace = v1.kind("Namespace")
        export type Namespace = typeof Namespace

        export const ServiceAccount = v1.kind("ServiceAccount")
        export type ServiceAccount = typeof ServiceAccount

        export const PersistentVolume = v1.kind("PersistentVolume")
        export type PersistentVolume = typeof PersistentVolume

        export const PersistentVolumeClaim = v1.kind("PersistentVolumeClaim")
        export type PersistentVolumeClaim = typeof PersistentVolumeClaim

        export const PodTemplate = v1.kind("PodTemplate")
        export type PodTemplate = typeof PodTemplate
    }

    export const apps = Kind.group("apps")
    export type apps = typeof apps

    export const metrics = Kind.group("metrics.k8s.io")
    export type metrics = typeof metrics
    export namespace metrics_ {
        export const v1beta1 = metrics.version("v1beta1")
        export type v1beta1 = typeof v1beta1

        export namespace v1beta1_ {
            export const NodeMetrics = v1beta1.kind("NodeMetrics")
            export type NodeMetrics = typeof NodeMetrics

            export const PodMetrics = v1beta1.kind("PodMetrics")
            export type PodMetrics = typeof PodMetrics
        }
    }
    export namespace apps_ {
        export const v1 = apps.version("v1")
        export type v1 = typeof v1

        export namespace v1_ {
            export const Deployment = v1.kind("Deployment")
            export type Deployment = typeof Deployment

            export const StatefulSet = v1.kind("StatefulSet")
            export type StatefulSet = typeof StatefulSet

            export const DaemonSet = v1.kind("DaemonSet")
            export type DaemonSet = typeof DaemonSet

            export const ReplicaSet = v1.kind("ReplicaSet")
            export type ReplicaSet = typeof ReplicaSet

            export const ControllerRevision = v1.kind("ControllerRevision")
            export type ControllerRevision = typeof ControllerRevision
        }
    }

    export const networking = Kind.group("networking.k8s.io")
    export type networking = typeof networking

    export namespace networking_ {
        export const v1 = networking.version("v1")
        export type v1 = typeof v1

        export namespace v1_ {
            export const NetworkPolicy = v1.kind("NetworkPolicy")
            export type NetworkPolicy = typeof NetworkPolicy
        }
    }

    export const gateway = Kind.group("gateway.networking.k8s.io")
    export type gateway = typeof gateway

    export const rbac = Kind.group("rbac.authorization.k8s.io")
    export type rbac = typeof rbac

    export namespace rbac_ {
        export const v1 = rbac.version("v1")
        export type v1 = typeof v1

        export namespace v1_ {
            export const Role = v1.kind("Role")
            export type Role = typeof Role

            export const ClusterRole = v1.kind("ClusterRole")
            export type ClusterRole = typeof ClusterRole

            export const RoleBinding = v1.kind("RoleBinding")
            export type RoleBinding = typeof RoleBinding

            export const ClusterRoleBinding = v1.kind("ClusterRoleBinding")
            export type ClusterRoleBinding = typeof ClusterRoleBinding
        }
    }
    export namespace gateway_ {
        export const v1 = gateway.version("v1")
        export type v1 = typeof v1

        export namespace v1_ {
            export const Gateway = v1.kind("Gateway")
            export type Gateway = typeof Gateway

            export const GatewayClass = v1.kind("GatewayClass")
            export type GatewayClass = typeof GatewayClass

            export const HttpRoute = v1.kind("HTTPRoute")
            export type HttpRoute = typeof HttpRoute

            export const TcpRoute = v1.kind("TCPRoute")
            export type TcpRoute = typeof TcpRoute

            export const TlsRoute = v1.kind("TLSRoute")
            export type TlsRoute = typeof TlsRoute
        }
    }

    export const storage = Kind.group("storage.k8s.io")
    export type storage = typeof storage
    export namespace storage_ {
        export const v1 = storage.version("v1")
        export type v1 = typeof v1

        export namespace v1_ {
            export const StorageClass = v1.kind("StorageClass")
            export type StorageClass = typeof StorageClass

            export const VolumeAttachment = v1.kind("VolumeAttachment")
            export type VolumeAttachment = typeof VolumeAttachment
        }
    }
}
