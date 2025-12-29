import { group } from "@k8ts/instruments"

const root = group("")
type root = typeof root

export namespace v1 {
    export const _ = root.version("v1")
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
