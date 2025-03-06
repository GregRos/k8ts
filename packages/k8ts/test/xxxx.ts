import { Image } from "@k8ts/instruments"
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
    yield factory.PersistentVolume("dev-sda", {
        capacity: "1Gi",
        accessModes: ["ReadWriteOnce"],
        backend: {
            type: "Local",
            path: "/dev/sda"
        },
        mode: "Block"
    })
})
const NS = nsFile.ref("Namespace:namespace")
const PV = nsFile.ref("PersistentVolume:pv-cool")
const file1 = K8ts.File("hahaha", function* (factory_base) {
    const factory = factory_base.namespace(NS)
    const claim = factory.Claim("claim", {
        accessModes: ["ReadWriteOnce"],
        bind: PV,
        storage: "1Gi--->5Gi"
    })
    yield claim
    const devClaim = factory.Claim("dev-claim", {
        accessModes: ["ReadWriteOnce"],
        bind: nsFile.ref("PersistentVolume:dev-sda"),
        storage: "1Gi--->5Gi"
    })
    const pods = factory.PodTemplate("xyz", {
        *scope(factory) {
            const v = factory.Volume("data", {
                backend: claim
            })

            const d = factory.Device("dev", {
                backend: devClaim
            })

            yield factory.Container("main", {
                image: Image.name("nginx").tag("latest"),
                ports: {
                    http: 80
                },
                mounts: {
                    "/xyz": v.mount(),
                    "/etc": v.mount(),
                    "/dev": d.mount()
                }
            })
        }
    })

    const svc2 = factory.Service("xyz", {
        impl: {
            type: "ClusterIp"
        },
        ports: {
            http: 80
        },
        backend: pods
    })
    const svc = factory.DomainRoute("my-route", {
        hostname: "example.com",
        parent: K8ts.External("Gateway", "gateway"),
        backend: svc2.getBackendRef("http")
    })

    yield svc
})
K8ts.emit(nsFile, file1)
