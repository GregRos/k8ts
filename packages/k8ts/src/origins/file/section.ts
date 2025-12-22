import {
    type Origin_Exporter_Props,
    type Resource_Core_Ref,
    Origin_Exporter
} from "@k8ts/instruments"
import { doddle, doddlify, seq } from "doddle"
import type { v1 } from "../../kinds"

export class File_Section_Scope {
    on: Origin_Section["on"]
    get __entity__() {
        return this._section
    }
    constructor(private readonly _section: Origin_Section) {
        this.on = this._section.on
    }
}
export interface File_Section_Props<Exported extends Resource_Core_Ref = Resource_Core_Ref>
    extends Origin_Exporter_Props {
    namespace?: Resource_Core_Ref<v1.Namespace._>
    SECTION(SCOPE: File_Section_Scope): Iterable<Exported>
}

export class Origin_Section extends Origin_Exporter<File_Section_Props> {
    get kind() {
        return "k8ts:File/Section"
    }
    #_ = doddle(() => {
        this.meta.overwrite({
            namespace: this._props.namespace?.name
        })
    }).pull()

    @doddlify
    protected __exports__() {
        return seq(
            this._props.SECTION.call(
                this,
                new File_Section_Scope(this)
            ) as Iterable<Resource_Core_Ref>
        ).cache()
    }
}
