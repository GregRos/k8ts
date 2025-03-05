import { ChildOrigin, type Exports, type Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata/."
import { seq, type Seq } from "doddle"
import { ClusterScopeFactory } from "../graph/cluster-scope"
import type { Base } from "../node/base"

export class K8tsFile<T extends Base> extends ChildOrigin implements Exports<T> {
    private readonly _nodes: Seq<T>
    constructor(
        parent: Origin,
        name: string,
        producer: (scope: ClusterScopeFactory) => Iterable<T>
    ) {
        super(name, Meta.make(), parent)
        this._nodes = seq(() => {
            return producer(new ClusterScopeFactory(this, Meta.make()))
        })
    }
}
