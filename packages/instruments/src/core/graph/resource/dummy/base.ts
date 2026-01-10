import { NullOrigin } from "../../origin/dummy"
import type { Gvk_Base } from "../gvk"
import { ResourceEntity } from "../resource"
export abstract class DummyResource<K extends Gvk_Base> extends ResourceEntity<string, any> {
    get noEmit() {
        return true
    }
    protected get __origin__() {
        return NullOrigin.instance
    }

    abstract get kind(): K
}
