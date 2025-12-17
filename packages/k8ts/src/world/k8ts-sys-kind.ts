import { Kind } from "@k8ts/instruments"
import { version } from "../version"

const major = +version.split(".")[0]

export namespace build {
    export const _ = Kind.group("build.k8ts.org")
    export type _ = typeof _

    export namespace current {
        export const _ = build._.version(`v${major}`)
        export type _ = typeof _

        export namespace File {
            export const _ = current._.kind("File")
            export type _ = typeof _
        }
        export namespace World {
            export const _ = current._.kind("World")
            export type _ = typeof _
        }
        export namespace External {
            export const _ = current._.kind("External")
            export type _ = typeof _
        }
    }
}
