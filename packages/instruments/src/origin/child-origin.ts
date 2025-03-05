import type { Meta } from "@k8ts/metadata"
import { seq } from "doddle"
import { Origin } from "./base-origin"

export class ChildOrigin extends Origin {
    constructor(
        name: string,
        meta: Meta,
        readonly parent: Origin
    ) {
        super(name, meta)
    }

    override get registered() {
        return this.parent.registered
    }
    override get parents() {
        const self = this
        return seq(function* () {
            const cur = self
            while (cur.parent) {
                yield cur.parent
            }
        })
    }

    override toString() {
        return this.parents.join(" -> ").pull()
    }
}
