import type { Base } from "./base"

export class DelayedResources<T extends Base> implements Iterable<T> {
    constructor(readonly nodes: () => Iterable<T>) {}

    [Symbol.iterator]() {
        return this.nodes()[Symbol.iterator]()
    }

    static of<T extends Base>(nodes: () => Iterable<T>) {
        return new DelayedResources(nodes)
    }
}
