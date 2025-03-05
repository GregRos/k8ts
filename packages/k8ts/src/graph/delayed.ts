import { seq, type Seq } from "doddle"
import type { Base } from "./base"

export class Manifests<T extends Base> implements Iterable<T> {
    constructor(readonly nodes: Seq<T>) {}

    [Symbol.iterator]() {
        return this.nodes[Symbol.iterator]()
    }

    static make<T extends Base>(nodes: Seq.Input<T>) {
        return new Manifests(seq(nodes))
    }
}

export interface Pullable<T> {
    pull(): T
}

export type MaybePullable<T> = T | Pullable<T>
