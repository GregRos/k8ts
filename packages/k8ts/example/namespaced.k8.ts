import { Cmd, Cron, Image, localRefFile } from "@k8ts/instruments"
import {
    ClusterRole,
    ClusterRoleBinding,
    ConfigMap,
    CronJob,
    Deployment,
    HttpRoute,
    Pvc,
    Service,
    ServiceAccount
} from "k8ts"
import { gateway, metrics, storage, v1 } from "k8ts/kinds"
import k8tsFile from "./cluster-scoped.k8"
import { W } from "./world"
const k8sNamespace = k8tsFile["Namespace/namespace"]
const ext_gateways_ns = v1.Namespace._.refKey({
    name: "gateways"
})
const ext_gateway = gateway.v1.Gateway._.refKey({
    name: "gateway",
    namespace: ext_gateways_ns
}).External()
const ext_topolvm_class = storage.v1.StorageClass._.refKey({
    name: "topolvm"
}).External()
const ext_config_map = v1.ConfigMap._.refKey({
    name: "config",
    namespace: k8sNamespace
}).External({
    keys: ["a", "b", "c"]
})
const cool = k8tsFile["PersistentVolume/pv-cool"]
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
                    $storageClass: ext_topolvm_class,
                    $accessModes: ["ReadWriteOnce"],
                    $storage: "1Gi->5Gi"
                })
                const claim3 = new Pvc("claim3", {
                    $storageClass: ext_topolvm_class,
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
                    $data: {
                        "config.yaml": localRefFile("./example.txt").as("text")
                    }
                })

                const deploy2 = new Deployment("xyz2", {
                    replicas: 1,
                    $template: {
                        *$POD(k) {
                            const v = k.Volume("data", {
                                $backend: claim
                            })

                            const r = new ConfigMap("abc", {
                                $data: {
                                    a: "1"
                                }
                            })
                            r.keys
                            const v12 = k.Volume("data2", {
                                $backend: r
                            })
                            const ext_configMap = v1.ConfigMap._.refKey({
                                name: "config",
                                namespace: k8sNamespace
                            }).External({
                                keys: ["a", "b", "c"]
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
                                        $backend: ext_configMap,
                                        key: "b"
                                    },
                                    a123: {
                                        $backend: ext_configMap,
                                        key: "c"
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
                const serviceAccount = new ServiceAccount("x", {
                    automountToken: true
                })

                yield serviceAccount

                const clusterRole = new ClusterRole("name", {
                    *rules(ROLE) {
                        // Core API group: namespaces, pods, nodes
                        yield ROLE.Rule(v1.Namespace._, v1.Pod._, v1.Node._).verbs("get", "list")

                        // gateway.networking.k8s.io: httproutes, gateways
                        yield ROLE.Rule(gateway.v1.HttpRoute._, gateway.v1.Gateway._).verbs(
                            "get",
                            "list"
                        )

                        // metrics.k8s.io: nodes, pods
                        yield ROLE.Rule(
                            metrics.v1beta1.NodeMetrics._,
                            metrics.v1beta1.PodMetrics._
                        ).verbs("get", "list")
                    }
                })

                const clusterRoleBinding = new ClusterRoleBinding("name", {
                    $role: clusterRole,
                    $subjects: [serviceAccount]
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
                    $gateway: ext_gateway,
                    $backend: svc2.portRef("x")
                })

                yield route
            }
        })
    }
})
