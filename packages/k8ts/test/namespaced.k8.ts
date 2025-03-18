import { Image } from "@k8ts/instruments"
import { gateway_v1 } from "@lib/api-versions"
import k8tsFile from "./cluster-scoped.k8"
import { W } from "./world"
const k8sNamespace = k8tsFile["Namespace/namespace"]
const k8sPv = k8tsFile["PersistentVolume/dev-sda"]
const cool = k8tsFile["PersistentVolume/pv-cool"]
const gwKind = gateway_v1.kind("Gateway")
export default W.File("deployment.yaml", {
    scope: k8sNamespace,
    *FILE(k) {
        const claim = k.Claim("claim", {
            bind: cool,
            accessModes: ["ReadWriteOnce"],
            storage: "1Gi--->5Gi"
        })

        yield claim
        const devClaim = k.Claim("dev-claim", {
            accessModes: ["ReadWriteOnce"],
            bind: k8tsFile["PersistentVolume/dev-sda"],
            storage: "1Gi--->5Gi"
        })

        const deploy = k.Deployment("xyz", {
            replicas: 1,
            template: {
                *POD(k) {
                    const v = k.Volume("data", {
                        backend: claim
                    })

                    const d = k.Device("dev", {
                        backend: devClaim
                    })

                    yield k.Container("main", {
                        image: Image.name("nginx").tag("latest"),
                        ports: {
                            http: 80
                        },
                        mounts: {
                            "/xyz": v.mount(),
                            "/etc": v.mount(),
                            "/dev": d.mount()
                        },
                        resources: {
                            cpu: "100m--->500m",
                            memory: "100Mi--->500Mi"
                        }
                    })
                }
            }
        })

        const svc2 = k.Service("xyz", {
            frontend: {
                type: "ClusterIp"
            },
            ports: {
                http: 80
            },
            backend: deploy
        })
        yield svc2
        const route = k.DomainRoute("my-route", {
            hostname: "example.com",
            parent: W.External(gwKind, "gateway"),
            backend: svc2.getPortRef("http")
        })

        yield route
    }
})
