import { K8ts } from "@lib"
const nsFile = K8ts.File("globals", function* (factory) {
    yield factory.Namespace("namespace")
    yield factory.PersistentVolume("pv-cool", {
        capacity: "1Gi",
        accessModes: ["ReadWriteOnce"],
        backend: {
            type: "Local",
            path: "/mnt/data"
        }
    })
})
const NS = nsFile.ref("Namespace:namespace")
const PV = nsFile.ref("PersistentVolume:pv-cool")
const file1 = K8ts.File("hahaha", function* (factory_base) {
    const factory = factory_base.namespace(NS)
    yield factory.Claim("claim", {
        accessModes: ["ReadWriteOnce"],
        bind: PV,
        storage: "1Gi--->5Gi"
    })
})
K8ts.emit(nsFile, file1)
