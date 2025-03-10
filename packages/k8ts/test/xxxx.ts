import { K8TS } from "@lib"

import clusterScopedK8 from "cluster-scoped.k8"
import { declare } from "declare-it"
import namespacedK8 from "namespaced.k8"
declare.setup("console")
K8TS.emit(namespacedK8, clusterScopedK8)
