export * from "./external"
export * from "./file"
export * as ScopedFactory from "./file/factory"
export * from "./resources"
import { K8tsWorld } from "./world"
export const K8TS = new K8tsWorld("(world)")
