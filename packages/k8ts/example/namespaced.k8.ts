import { Image, localFile } from "@k8ts/instruments"
import { api } from "@lib/kinds"
import k8tsFile from "./cluster-scoped.k8"
import { W } from "./world"
const k8sNamespace = k8tsFile["Namespace/namespace"]
const k8sPv = k8tsFile["PersistentVolume/dev-sda"]
const cool = k8tsFile["PersistentVolume/pv-cool"]
const gwKind = api.gateway_.v1_.Gateway
export default W.Scope(k8sNamespace)
    .File("deployment2.yaml")
    .metadata({
        "^a": "xxxx"
    })
    .Resources(function* FILE(FILE) {
        const claim = FILE.Claim("claim", {
            $bind: cool,
            $accessModes: ["ReadWriteOnce"],
            $storage: "1Gi->5Gi"
        })

        const claim2 = FILE.Claim("claim2", {
            $storageClass: W.External(api.storage_.v1_.StorageClass, "topolvm"),
            $accessModes: ["ReadWriteOnce"],
            $storage: "1Gi->5Gi"
        })
        const claim3 = FILE.Claim("claim3", {
            $storageClass: W.External(api.storage_.v1_.StorageClass, "topolvm"),
            $accessModes: ["ReadWriteOnce"],
            $storage: "=1Gi"
        })
        yield claim
        const devClaim = FILE.Claim("dev-claim", {
            $accessModes: ["ReadWriteOnce"],
            $bind: k8tsFile["PersistentVolume/dev-sda"],
            $storage: "1Gi->5Gi"
        })
        yield FILE.ConfigMap("config", {
            data: {
                "config.yaml": localFile("./example.txt")
            }
        })
        const deploy2 = FILE.Deployment("xyz2", {
            replicas: 1
        })
            .Template({})
            .POD(function* POD(k) {
                const v = k.Volume("data", {
                    $backend: claim
                })

                FILE.ConfigMap("abc", {
                    data: {
                        a: "1"
                    }
                })

                const d = k.Device("dev", {
                    $backend: devClaim
                })

                yield k.Container("main", {
                    $image: Image.name("nginx/nginx").tag("latest"),
                    $ports: {
                        x: 3333
                    },
                    $mounts: {
                        "/xyz": v.Mount(),
                        "/etc": v.Mount(),
                        "/dev": d.Mount()
                    },
                    $resources: {
                        cpu: "100m->500m",
                        memory: "100Mi->500Mi"
                    }
                })
            })

        const svc2 = FILE.Service("xyz", {
            $frontend: {
                type: "ClusterIP"
            },
            $ports: {
                x: 80
            },
            $backend: deploy2
        })

        yield svc2
        const route = FILE.DomainRoute("my-route", {
            $hostname: "example.com",
            $gateway: W.External(gwKind, "gateway", "gateways"),
            $backend: svc2.portRef("x")
        })

        yield route
    })
