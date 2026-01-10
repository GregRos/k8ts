import { Namespace, Pv } from "k8ts"
import { storage } from "../dist/kinds"
import { W } from "./world"

export default W.File("namespace.yaml", {
    *resources$() {
        const topolvm = storage.v1.StorageClass._.refKey({
            name: "topolvm"
        }).DummyResource()
        yield new Namespace("namespace")
        yield new Pv("pv-cool", {
            $capacity: {
                storage: "1Gi"
            },
            $storageClass: topolvm,
            $accessModes: ["ReadWriteOnce"],
            nodeAffinity: {}
        })
        yield new Pv("dev-sda", {
            $capacity: {
                storage: "1Gi"
            },
            $accessModes: ["ReadWriteOnce"],
            $backend: {
                kind: "Local",
                path: "/dev/sda"
            },
            $mode: "Block",
            nodeAffinity: {}
        })
        yield new Pv("nfs-volume", {
            $capacity: {
                storage: "5Gi"
            },
            $accessModes: ["ReadWriteMany"],
            $backend: {
                kind: "NFS",
                server: "nfs.example.com",
                path: "/exported/path"
            }
        })
    }
})
