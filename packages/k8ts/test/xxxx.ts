import { Image } from "@k8ts/instruments"
import { K8TS } from "@lib"
const k8tsFile = K8TS.ClusterFile({
    filename: "namespace.yaml",
    *def(FILE) {
        yield FILE.Namespace("namespace")
        yield FILE.PersistentVolume("pv-cool", {
            capacity: "1Gi",
            accessModes: ["ReadWriteOnce"],
            backend: {
                type: "Local",
                path: "/mnt/data"
            }
        })
        yield FILE.PersistentVolume("dev-sda", {
            capacity: "1Gi",
            accessModes: ["ReadWriteOnce"],
            backend: {
                type: "Local",
                path: "/dev/sda"
            },
            mode: "Block"
        })
    }
})
k8tsFile.ref("Namespace/namespace")
const k8sNamespace = k8tsFile.ref("Namespace/namespace")
const k8sPv = k8tsFile.ref("PersistentVolume/pv-cool")

const k8tsFile2 = K8TS.NamespacedFile(k8sNamespace, {
    filename: "deployment.yaml",
    *def(FILE) {
        const claim = FILE.Claim("claim", {
            bind: k8sPv,
            accessModes: ["ReadWriteOnce"],
            storage: "1Gi--->5Gi"
        })
        yield claim
        const devClaim = FILE.Claim("dev-claim", {
            accessModes: ["ReadWriteOnce"],
            bind: k8tsFile.ref("PersistentVolume/dev-sda"),
            storage: "1Gi--->5Gi"
        })
        const pods = FILE.PodTemplate("xyz", {
            *scope(POD) {
                const v = POD.Volume("data", {
                    backend: claim
                })

                const d = POD.Device("dev", {
                    backend: devClaim
                })

                yield POD.Container("main", {
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

        const svc2 = FILE.Service("xyz", {
            impl: {
                type: "ClusterIp"
            },
            ports: {
                http: 80
            },
            backend: pods
        })
        yield svc2
        const route = FILE.DomainRoute("my-route", {
            hostname: "example.com",
            parent: K8TS.External("Gateway", "gateway"),
            backend: svc2.getBackendRef("http")
        })

        yield route
    }
})
K8TS.emit(k8tsFile, k8tsFile2)
