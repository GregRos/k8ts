export type K8tsAccessControlKind =
    | "Role"
    | "RoleBinding"
    | "ClusterRole"
    | "ClusterRoleBinding"
    | "ServiceAccount"

export type K8tsPersistentKind =
    | "PersistentVolume"
    | "PersistentVolumeClaim"
    | "StorageClass"
    | "VolumeAttachment"
    | "VolumeSnapshot"
    | "VolumeSnapshotClass"

export type K8tsConfigKind = "ConfigMap" | "Secret"

export type K8tsWorkloadKind =
    | "Deployment"
    | "StatefulSet"
    | "Job"
    | "CronJob"
    | "PodDisruptionBudget"
    | "HorizontalPodAutoscaler"
    | "PodSecurityPolicy"

export type K8tsNetworkKind = "NetworkPolicy" | "Service"

export type K8tsInfrastructureKind = "Namespace" | "Node" | ""
