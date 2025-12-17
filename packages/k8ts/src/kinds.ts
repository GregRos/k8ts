import * as appsMod from "./kinds/apps"
import * as batchMod from "./kinds/batch"
import * as defaultMod from "./kinds/default"
import * as gatewayMod from "./kinds/gateway"
import * as metricsMod from "./kinds/metrics"
import * as networkingMod from "./kinds/networking"
import * as rbacMod from "./kinds/rbac"
import * as storageMod from "./kinds/storage"

export namespace api2 {
    export import _ = defaultMod._
    export import v1 = defaultMod.v1

    export import apps = appsMod.apps
    export import batch = batchMod.batch
    export import rbac = rbacMod.rbac
    export import networking = networkingMod.networking
    export import gateway = gatewayMod.gateway
    export import storage = storageMod.storage
    export import metrics = metricsMod.metrics
}
