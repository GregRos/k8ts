import { K8tsScope } from "../graph/k8ts-scope"
import { NamespacedScope } from "../graph/namespace-scope"

export class K8tsClusterFile extends K8tsScope {}

export class K8tsNamespaceFile extends NamespacedScope {}
