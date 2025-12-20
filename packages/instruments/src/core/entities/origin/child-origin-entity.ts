import { FwRef_Exports, type LiveRefable, type Refable } from "../../reference"
import { OriginEntity } from "./origin-entity"
import type { Origin_Props } from "./origin-node"

export interface ChildOrigin_Props extends Origin_Props {
    exports(): Iterable<Refable>
}

export abstract class ChildOriginEntity<
    Props extends ChildOrigin_Props = ChildOrigin_Props
> extends OriginEntity<Props> {
    constructor(
        private readonly _parent: OriginEntity,
        name: string,
        props: Props
    ) {
        super(name, props)
        this._parent["__attach_kid__"](this)
    }

    protected __parent__() {
        return this._parent
    }

    *[Symbol.iterator](): Iterator<LiveRefable> {
        const boundExports = this.__bind__(this.props.exports)
        yield* boundExports()
    }

    protected __exports__<Exports extends Refable>(): FwRef_Exports<this, Exports> {
        return FwRef_Exports({
            entity: this,
            exports: this
        })
    }
}
