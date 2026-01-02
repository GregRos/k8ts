import { Namespace, Pv } from "k8ts"
import { storage } from "k8ts/kinds"
import { W } from "./world"

export default W.File("namespace.yaml", {
    *FILE() {
        const topolvm = storage.v1.StorageClass._.refKey({
            name: "topolvm"
        }).External()
        yield new Namespace("namespace")
        2
        yield new Pv("pv-cool", {
            $capacity: "1Gi",
            $storageClass: topolvm,
            $accessModes: ["ReadWriteOnce"],
            nodeAffinity: {}
        })
        yield new Pv("dev-sda", {
            $capacity: "1Gi",
            $accessModes: ["ReadWriteOnce"],
            $backend: {
                kind: "Local",
                path: "/dev/sda"
            },
            $mode: "Block",
            nodeAffinity: {}
        })
        yield new Pv("nfs-volume", {
            $capacity: "5Gi",
            $accessModes: ["ReadWriteMany"],
            $backend: {
                kind: "NFS",
                server: "nfs.example.com",
                path: "/exported/path"
            }
        })
    }
})
