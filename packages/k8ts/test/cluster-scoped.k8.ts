import { W } from "./world"

export default W.File({
    scope: "cluster",
    name: "namespace",
    *FILE(FILE) {
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
