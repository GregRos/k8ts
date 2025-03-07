export * from "./external"
export * from "./file"
export * as ScopedFactory from "./file/factory"
export * from "./resources"
import { K8ts as K8tsClass } from "./k8ts"
export const K8TS = new K8tsClass()
