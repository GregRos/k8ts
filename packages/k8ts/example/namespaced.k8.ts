import { Image, localFile } from "@k8ts/instruments"
import { gateway_v1 } from "@lib/api-versions"
import k8tsFile from "./cluster-scoped.k8"
import { W } from "./world"
const k8sNamespace = k8tsFile["Namespace/namespace"]
const k8sPv = k8tsFile["PersistentVolume/dev-sda"]
const cool = k8tsFile["PersistentVolume/pv-cool"]
const gwKind = gateway_v1.kind("Gateway")
export default W.Scope(k8sNamespace)
    .File("deployment2.yaml")
    .Resources(function* FILE(FILE) {
        const claim = FILE.Claim("claim", {
            bind: cool,
            accessModes: ["ReadWriteOnce"],
            storage: "1Gi->5Gi"
        })

        yield claim
        const devClaim = FILE.Claim("dev-claim", {
            accessModes: ["ReadWriteOnce"],
            bind: k8tsFile["PersistentVolume/dev-sda"],
            storage: "1Gi->5Gi"
        })
        yield FILE.ConfigMap("config", {
            data: {
                "config.yaml": localFile("./example.txt")
            }
        })
        const deploy2 = FILE.Deployment("xyz2", {
            replicas: 1
        })
            .Template()
            .POD(function* POD(k) {
                const v = k.Volume("data", {
                    backend: claim
                })

                FILE.ConfigMap("abc", {
                    data: {
                        a: "1"
                    }
                })

                const d = k.Device("dev", {
                    backend: devClaim
                })

                yield k.Container("main", {
                    image: Image.name("nginx/nginx").tag("latest"),
                    ports: {
                        http: 80
                    },
                    mounts: {
                        "/xyz": v.Mount(),
                        "/etc": v.Mount(),
                        "/dev": d.Mount()
                    },
                    resources: {
                        cpu: "100m->500m",
                        memory: "100Mi->500Mi"
                    }
                })
            })

        const svc2 = FILE.Service("xyz", {
            frontend: {
                type: "ClusterIP"
            },
            ports: {},
            backend: deploy2
        })
        yield svc2
        const route = FILE.DomainRoute("my-route", {
            hostname: "example.com",
            gateway: W.External(gwKind, "gateway"),
            backend: svc2.portRef("http")
        })

        yield route
    })
