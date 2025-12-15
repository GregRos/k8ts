import { Kind } from "@k8ts/instruments"
import { version } from "./version"
const major = version.split(".")[0]
export namespace K8tsKinds {
    export const build = Kind.group("build.k8ts.org")
    export namespace build_ {
        export const current = build.version(`v${major}`)
        export namespace current_ {
            export const File = current.kind("File")
            export type File = typeof File

            export const World = current.kind("World")
            export type World = typeof World

            export const External = current.kind("External")
            export type External = typeof External
        }
    }
}
