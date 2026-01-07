import { DummyOrigin } from "../../origin/dummy"
import type { GVK_Base } from "../api-kind"
import { Resource } from "../resource"
export abstract class DummyResource<K extends GVK_Base> extends Resource<string, any> {
    get noEmit() {
        return true
    }
    protected __origin__() {
        return DummyOrigin.instance
    }

    abstract get kind(): K
}
