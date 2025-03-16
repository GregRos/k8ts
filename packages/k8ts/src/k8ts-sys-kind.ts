import { Kind } from "@k8ts/instruments"
import { version } from "./version"
const major = version.split(".")[0]
export const k8tsBuildKind = Kind.group("build.k8ts.org").version(`v${major}`)
