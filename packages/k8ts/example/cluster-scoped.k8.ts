import { api } from "@lib/kinds"
import { W } from "./world"

export default W.Scope("cluster")
    .File("namespace.yaml")
    .Resources(function* FILE(FILE) {
        const ref = W.External(api.storage_.v1_.StorageClass, "topolvm")
        yield FILE.Namespace("namespace")
        yield FILE.PersistentVolume("pv-cool", {
            $capacity: "1Gi",
            $storageClass: ref,
            $accessModes: ["ReadWriteOnce"],
            nodeAffinity: {} as any
        })
        yield FILE.PersistentVolume("dev-sda", {
            $capacity: "1Gi",
            $accessModes: ["ReadWriteOnce"],
            $backend: {
                type: "Local",
                path: "/dev/sda"
            },
            $mode: "Block",
            nodeAffinity: {} as any
        })
    })
