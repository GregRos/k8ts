import { Kind } from "@k8ts/instruments"

export namespace api2 {
    export const _ = Kind.group("")
    export type _ = typeof _

    export namespace v1 {
        export const _ = api2._.version("v1")
        export type _ = typeof _

        export namespace Pod {
            export const _ = v1._.kind("Pod")
            export type _ = typeof _

            export namespace Container {
                export const _ = Pod._.subkind("Container")
                export type _ = typeof _
                export namespace Port {
                    export const _ = Container._.subkind("Port")
                    export type _ = typeof _
                }
                export namespace EnvVar {
                    export const _ = Container._.subkind("EnvVar")
                    export type _ = typeof _
                }
                export namespace VolumeMount {
                    export const _ = Container._.subkind("VolumeMount")
                    export type _ = typeof _
                }
                export namespace DeviceMount {
                    export const _ = Container._.subkind("DeviceMount")
                    export type _ = typeof _
                }
            }

            export namespace Volume {
                export const _ = Pod._.subkind("Volume")
                export type _ = typeof _
            }
            export namespace Device {
                export const _ = Volume._.subkind("Device")
                export type _ = typeof _
            }
        }

        export namespace ConfigMap {
            export const _ = v1._.kind("ConfigMap")
            export type _ = typeof _
        }
        export namespace Secret {
            export const _ = v1._.kind("Secret")
            export type _ = typeof _
        }
        export namespace Service {
            export const _ = v1._.kind("Service")
            export type _ = typeof _
        }
        export namespace Node {
            export const _ = v1._.kind("Node")
            export type _ = typeof _
        }
        export namespace Namespace {
            export const _ = v1._.kind("Namespace")
            export type _ = typeof _
        }
        export namespace ServiceAccount {
            export const _ = v1._.kind("ServiceAccount")
            export type _ = typeof _
        }
        export namespace PersistentVolume {
            export const _ = v1._.kind("PersistentVolume")
            export type _ = typeof _
        }
        export namespace PersistentVolumeClaim {
            export const _ = v1._.kind("PersistentVolumeClaim")
            export type _ = typeof _
        }
        export namespace PodTemplate {
            export const _ = v1._.kind("PodTemplate")
            export type _ = typeof _
        }
    }

    export namespace apps {
        export const _ = Kind.group("apps")
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

    export namespace rbac {
        export const _ = Kind.group("rbac.authorization.k8s.io")
        export type _ = typeof _
        export namespace v1 {
            export const _ = rbac._.version("v1")
            export type _ = typeof _
            export namespace Role {
                export const _ = v1._.kind("Role")
                export type _ = typeof _
            }
            export namespace ClusterRole {
                export const _ = v1._.kind("ClusterRole")
                export type _ = typeof _
            }
            export namespace RoleBinding {
                export const _ = v1._.kind("RoleBinding")
                export type _ = typeof _
            }
            export namespace ClusterRoleBinding {
                export const _ = v1._.kind("ClusterRoleBinding")
                export type _ = typeof _
            }
        }
    }

    export namespace networking {
        export const _ = Kind.group("networking.k8s.io")
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

    export namespace gateway {
        export const _ = Kind.group("gateway.networking.k8s.io")
        export type _ = typeof _
        export namespace v1 {
            export const _ = gateway._.version("v1")
            export type _ = typeof _
            export namespace Gateway {
                export const _ = v1._.kind("Gateway")
                export type _ = typeof _
            }
            export namespace GatewayClass {
                export const _ = v1._.kind("GatewayClass")
                export type _ = typeof _
            }
            export namespace HttpRoute {
                export const _ = v1._.kind("HTTPRoute")
                export type _ = typeof _
            }
            export namespace TcpRoute {
                export const _ = v1._.kind("TCPRoute")
                export type _ = typeof _
            }
            export namespace TlsRoute {
                export const _ = v1._.kind("TLSRoute")
                export type _ = typeof _
            }
        }
    }

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

    export namespace metrics {
        export const _ = Kind.group("metrics.k8s.io")
        export type _ = typeof _
        export namespace v1beta1 {
            export const _ = metrics._.version("v1beta1")
            export type _ = typeof _
            export namespace NodeMetrics {
                export const _ = v1beta1._.kind("NodeMetrics")
                export type _ = typeof _
            }
            export namespace PodMetrics {
                export const _ = v1beta1._.kind("PodMetrics")
                export type _ = typeof _
            }
        }
    }
}
