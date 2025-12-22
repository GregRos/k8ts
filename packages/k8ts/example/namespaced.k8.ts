import { Cmd, Cron, Image, localFile } from "@k8ts/instruments"
import { ConfigMap, CronJob, Deployment, HttpRoute, Pvc, Service } from "k8ts"
import { gateway, storage, v1 } from "k8ts/kinds"
import k8tsFile from "./cluster-scoped.k8"
import { W } from "./world"
const k8sNamespace = k8tsFile["Namespace/namespace"]
const externalNamesapce = W.External(v1.Namespace._, "k8ts-ns")
const k8sPv = k8tsFile["PersistentVolume/dev-sda"]
const cool = k8tsFile["PersistentVolume/pv-cool"]
const gwKind = gateway.v1.Gateway._
export default W.File("deployment2.yaml", {
    meta: {
        "^a": "a"
    },
    namespace: k8sNamespace,
    *FILE(FILE) {
        yield FILE.Section("inner", {
            *SECTION(SECTION) {
                const claim = new Pvc("claim", {
                    $bind: cool,
                    $accessModes: ["ReadWriteOnce"],
                    $storage: "1Gi->5Gi"
                })

                const claim2 = new Pvc("claim2", {
                    $storageClass: W.External(storage.v1.StorageClass._, "topolvm"),
                    $accessModes: ["ReadWriteOnce"],
                    $storage: "1Gi->5Gi"
                })
                const claim3 = new Pvc("claim3", {
                    $storageClass: W.External(storage.v1.StorageClass._, "topolvm"),
                    $accessModes: ["ReadWriteOnce"],
                    $storage: "=1Gi"
                })
                yield claim
                yield new CronJob("test", {
                    $schedule: Cron.hourly,
                    timeZone: "UTC",
                    $template: {
                        restartPolicy: "Never",
                        *$POD(POD) {
                            yield POD.Container("main", {
                                $image: Image.name("docker.io/library/busybox").tag("latest"),
                                $command: Cmd("/bin/sh").option({
                                    "-c": "date; echo Hello from the Kubernetes cluster"
                                }),
                                $resources: {
                                    cpu: "100m->500m",
                                    memory: "100Mi->500Mi",
                                    "a/b": "1->2"
                                }
                            })
                        }
                    }
                })
                const a = k8tsFile["PersistentVolume/dev-sda"]
                const devClaim = new Pvc("dev-claim", {
                    $accessModes: ["ReadWriteOnce"],
                    $bind: k8tsFile["PersistentVolume/dev-sda"],
                    $storage: "1Gi->5Gi"
                })
                yield new ConfigMap("config", {
                    data: {
                        "config.yaml": localFile("./example.txt")
                    }
                })
                const deploy2 = new Deployment("xyz2", {
                    replicas: 1,
                    $template: {
                        *$POD(k) {
                            const v = k.Volume("data", {
                                $backend: claim
                            })

                            new ConfigMap("abc", {
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
                                    x: 3333,
                                    y: 1111
                                },
                                $mounts: {
                                    "/xyz": v.Mount(),
                                    "/etc": v.Mount(),
                                    "/dev": d.Mount()
                                },

                                $resources: {
                                    cpu: "100m->500m",
                                    memory: "100Mi->500Mi"
                                },
                                $env: {
                                    abc: "a",
                                    xyz: {
                                        $ref: W.External(v1.ConfigMap._, "config"),
                                        key: "abc"
                                    },
                                    a123: {
                                        $ref: W.External(v1.Secret._, "config"),
                                        key: "a123"
                                    }
                                }
                            })
                        }
                    }
                })

                const svc2 = new Service("xyz", {
                    $frontend: {
                        type: "ClusterIP"
                    },
                    $ports: {
                        x: 80,
                        y: 1111
                    },
                    $backend: deploy2
                })

                const addr1 = svc2.address("http", "x")
                const addr2 = svc2.address("http", "y")
                console.log(addr1)
                console.log(addr2)
                console.assert(addr1, "http://xyz.namespace.svc.cluster.local")
                console.assert(addr2, "http://xyz.namespace.svc.cluster.local:1111")
                yield svc2
                const route = new HttpRoute("my-route", {
                    $hostname: "example.com",
                    $gateway: W.External(gwKind, "gateway", "gateways"),
                    $backend: svc2.portRef("x")
                })

                yield route
            }
        })
    }
})
