import { Kind } from "@k8ts/instruments"

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
