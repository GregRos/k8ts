import { Kind } from "@k8ts/instruments"
export namespace api {
    export const v1 = Kind.version("v1")

    export namespace v1_ {
        export function kind_<Name extends string>(name: Name): Kind<Name, typeof v1> {
            return v1.kind(name)
        }
        export const ConfigMap = v1.kind("ConfigMap")
        export const Secret = v1.kind("Secret")
        export const Service = v1.kind("Service")
        export const Pod = v1.kind("Pod")
        export namespace Pod_ {
            export const Container = Pod.subkind("Container")
            export const Port = Container.subkind("Port")
            export const EnvVar = Container.subkind("EnvVar")
            export const VolumeMount = Container.subkind("VolumeMount")
            export const DeviceMount = Container.subkind("DeviceMount")
            export const Volume = Pod.subkind("Volume")
            export const Device = Volume.subkind("Device")
        }
        export const Node = v1.kind("Node")
        export const Namespace = v1.kind("Namespace")
        export const ServiceAccount = v1.kind("ServiceAccount")
        export const PersistentVolume = v1.kind("PersistentVolume")
        export const PersistentVolumeClaim = v1.kind("PersistentVolumeClaim")
        export const PodTemplate = v1.kind("PodTemplate")
    }
    export const apps = Kind.group("apps")
    export namespace apps_ {
        export const v1 = apps.version("v1")
        export namespace v1_ {
            export const Deployment = v1.kind("Deployment")
            export const StatefulSet = v1.kind("StatefulSet")
            export const DaemonSet = v1.kind("DaemonSet")
            export const ReplicaSet = v1.kind("ReplicaSet")
            export const ControllerRevision = v1.kind("ControllerRevision")
        }
    }

    export const networking = Kind.group("networking.k8s.io")

    export namespace networking_ {
        export const v1 = networking.version("v1")
        export namespace v1_ {
            export const NetworkPolicy = v1.kind("NetworkPolicy")
        }
    }
    export const gateway = Kind.group("gateway.networking.k8s.io")
    export namespace gateway_ {
        export const v1 = gateway.version("v1")
        export namespace v1_ {
            export const Gateway = v1.kind("Gateway")
            export const GatewayClass = v1.kind("GatewayClass")
            export const HttpRoute = v1.kind("HTTPRoute")
            export const TcpRoute = v1.kind("TCPRoute")
            export const TlsRoute = v1.kind("TLSRoute")
        }
    }
}
