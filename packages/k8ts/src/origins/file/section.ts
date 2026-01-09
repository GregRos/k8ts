import { type OriginExporter_Props, type ResourceRef, ExporterOrigin } from "@k8ts/instruments"
import { doddlify, seq } from "doddle"
import type { v1 } from "../../kinds"

export class K8tsFile_Section_Scope {
    on: K8tsFile_Section["on"]
    get __entity__() {
        return this._section
    }
    constructor(private readonly _section: K8tsFile_Section) {
        this.on = this._section.on
    }
}
export interface K8tsFile_Section_Props<Exported extends ResourceRef = ResourceRef>
    extends OriginExporter_Props {
    namespace?: ResourceRef<v1.Namespace._>
    Section(SECTION: K8tsFile_Section_Scope): Iterable<Exported>
}

export class K8tsFile_Section extends ExporterOrigin<K8tsFile_Section_Props> {
    get kind() {
        return "[k8ts] File/Section"
    }

    get namespace() {
        return this.__parent__.cast(ExporterOrigin).namespace
    }
    @doddlify
    protected __exports__() {
        return seq(
            this._props.Section.call(
                this,
                new K8tsFile_Section_Scope(this)
            ) as Iterable<ResourceRef>
        ).cache()
    }
}
