import { Image } from "@k8ts/instruments"
import { K8TS } from "@lib"

import { declare, type, type_of } from "declare-it"
declare.setup("console")

const k8sNamespace = k8tsFile["Namespace/namespace"]
const k8sPv = k8tsFile["PersistentVolume/dev-sda"]
const cool = k8tsFile["PersistentVolume/pv-cool"]
declare.it("has the right type", expect => {
    expect(type_of(k8sPv.props.mode)).to_equal(type<"Block" | undefined>)
})
const k8tsFile2 = K8TS.File({
    scope: k8sNamespace,
    filename: "deployment.yaml",
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
        const pods = k.PodTemplate("xyz", {
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
        })

        const deploy = k.Deployment("xyz", {
            replicas: 1,
            template: pods
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
            parent: K8TS.External("Gateway", "gateway"),
            backend: svc2.getPortRef("http")
        })

        k.Deployment("name", {
            replicas: 1,
            template: pods
        })

        yield route
    }
})
const svc = k8tsFile2["Service/xyz"]
K8TS.emit(k8tsFile, k8tsFile2)
