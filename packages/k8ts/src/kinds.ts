import { From_Groups } from "@k8ts/instruments"

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
