export * from "./external"
export * from "./file"
export * from "./resources"
export * as ScopedFactory from "./scoped-factory"
import { K8ts as K8tsClass } from "./k8ts"
export const K8TS = new K8tsClass()
