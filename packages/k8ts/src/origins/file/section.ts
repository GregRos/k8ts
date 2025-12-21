import {
    type Origin_Exporter_Props,
    type Resource_Core_Ref,
    Origin_Exporter
} from "@k8ts/instruments"
import { doddle } from "doddle"
import type { v1 } from "../../kinds"

export class File_Section_Scope {
    on: File_Section_Entity["on"]
    constructor(private readonly _section: File_Section_Entity) {
        this.on = this._section.on
    }
}
export interface File_Section_Props extends Origin_Exporter_Props {
    namespace: Resource_Core_Ref<v1.Namespace._>
}

export class File_Section_Entity extends Origin_Exporter<File_Section_Props> {
    get kind() {
        return "k8ts:File/Section"
    }
    #_ = doddle(() => {
        this.meta.overwrite({
            namespace: this._props.namespace.name
        })
    }).pull()
}
