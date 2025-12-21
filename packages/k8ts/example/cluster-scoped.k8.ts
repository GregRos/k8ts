import { Namespace, Pv } from "k8ts"
import { storage } from "k8ts/kinds"
import { W } from "./world"

export default W.File("namespace.yaml", {
    *FILE() {
        const ref = W.External(storage.v1.StorageClass._, "topolvm")
        yield new Namespace("namespace")

        yield new Pv("pv-cool", {
            $capacity: "1Gi",
            $storageClass: ref,
            $accessModes: ["ReadWriteOnce"],
            nodeAffinity: {} as any
        })
        yield new Pv("dev-sda", {
            $capacity: "1Gi",
            $accessModes: ["ReadWriteOnce"],
            $backend: {
                type: "Local",
                path: "/dev/sda"
            },
            $mode: "Block",
            nodeAffinity: {} as any
        })
        yield new Pv("nfs-volume", {
            $capacity: "5Gi",
            $accessModes: ["ReadWriteMany"],
            $backend: {
                type: "NFS",
                server: "nfs.example.com",
                path: "/exported/path"
            }
        })
    }
})
