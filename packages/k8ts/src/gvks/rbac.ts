import { group } from "@k8ts/instruments"

export namespace rbac {
    export const _ = group("rbac.authorization.k8s.io")
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
