import { W } from "./world"

export default W.Scope("cluster")
    .File("namespace.yaml")
    .Resources(function* FILE(FILE) {
        yield FILE.Namespace("namespace")
        yield FILE.PersistentVolume("pv-cool", {
            capacity: "1Gi",
            accessModes: ["ReadWriteOnce"],
            backend: {
                type: "Local",
                path: "/mnt/data"
            },
            nodeAffinity: {} as any
        })
        yield FILE.PersistentVolume("dev-sda", {
            capacity: "1Gi",
            accessModes: ["ReadWriteOnce"],
            backend: {
                type: "Local",
                path: "/dev/sda"
            },
            mode: "Block",
            nodeAffinity: {} as any
        })
    })
