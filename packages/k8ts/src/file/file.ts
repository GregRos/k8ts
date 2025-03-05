import { ChildOrigin, Exports, type Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata/."
import { seq, type Seq } from "doddle"
import { ClusterScopeFactory } from "../graph/cluster-scope"
import type { Base } from "../node/base"

export interface K8tsFile<T extends Base> extends Exports<T> {
    readonly filename: string
}

class _K8tsFile<T extends Base> extends ChildOrigin {
    readonly nodes: Seq<T>
    constructor(
        parent: Origin,
        readonly filename: string,
        producer: (scope: ClusterScopeFactory) => Iterable<T>
    ) {
        super(filename, Meta.make(), parent)
        this.nodes = seq(() => {
            return producer(new ClusterScopeFactory(this, Meta.make()))
        }).cache()
    }

    get origin() {
        return this
    }

    get [Symbol.iterator]() {
        return this.nodes[Symbol.iterator]()
    }

    ref(spec: string) {
        return this.nodes.find(e => e.key.equals(spec)).pull()
    }
}

export function File<T extends Base>(
    parent: Origin,
    name: string,
    producer: (scope: ClusterScopeFactory) => Iterable<T>
): K8tsFile<T> {
    const file = new _K8tsFile(parent, name, producer)
    const exports = Exports.make(file, file.nodes)
    return Object.assign(exports, {
        filename: name
    })
}
