import { type OriginExporter_Props, type ResourceRef, OriginExporter } from "@k8ts/instruments"
import { doddle, doddlify, seq } from "doddle"
import type { v1 } from "../../idents"

export class FileSectionScope {
    on: OriginSection["on"]
    get __entity__() {
        return this._section
    }
    constructor(private readonly _section: OriginSection) {
        this.on = this._section.on
    }
}
export interface FileSectionProps<Exported extends ResourceRef = ResourceRef>
    extends OriginExporter_Props {
    namespace?: ResourceRef<v1.Namespace._>
    SECTION(SCOPE: FileSectionScope): Iterable<Exported>
}

export class OriginSection extends OriginExporter<FileSectionProps> {
    get ident() {
        return "[k8ts] File/Section"
    }
    #_ = doddle(() => {
        this.metadata.overwrite({
            namespace: this._props.namespace?.name
        })
    }).pull()

    @doddlify
    protected __exports__() {
        return seq(
            this._props.SECTION.call(this, new FileSectionScope(this)) as Iterable<ResourceRef>
        ).cache()
    }
}
