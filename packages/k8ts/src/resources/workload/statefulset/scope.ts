import type { TemplateOrigin } from "@k8ts/instruments"
import type { Pvc_Props, PvVolumeMode } from "../../persistent"
import { Pvc } from "../../persistent"
import { Pod_Scope } from "../pod/container/scope"
export class StatefulSet_Scope extends Pod_Scope {
    constructor(
        podScope: Pod_Scope,
        private readonly _template: TemplateOrigin
    ) {
        super(podScope["_parent"])
    }

    PvcTemplate<Mode extends PvVolumeMode>(name: string, props: Pvc_Props<Mode>) {
        const pvc = this._template.attach(() => {
            return new Pvc(name, props, {
                scopedOrigin: this._template.owner["__origin__"]
            })
        })
        return this.Volume(pvc.ident.name, {
            $backend: pvc,
            $noEmit: true
        })
    }
}
