import { doddlify } from "doddle"
import yaml from "js-yaml"
import type { DataSource_Shape } from "./interface"
export type DataSource_JsObject_sFormatName = "json" | "yaml"
export interface DataSource_JsObject {
    to(format: DataSource_JsObject_sFormatName): DataSource_Shape<string>
}

class _DataSource_JsObject implements DataSource_JsObject {
    constructor(private readonly _obj: any) {}

    to(format: DataSource_JsObject_sFormatName): DataSource_Shape<string> {
        if (format === "json") {
            return new _DataSource_JsObject_Json(this._obj)
        } else {
            return new _DataSource_JsObject_Yaml(this._obj)
        }
    }
}

class _DataSource_JsObject_Json implements DataSource_Shape<string> {
    constructor(private readonly _obj: any) {}
    @doddlify
    pull() {
        return JSON.stringify(this._obj, null, 2)
    }
}

class _DataSource_JsObject_Yaml implements DataSource_Shape<string> {
    constructor(private readonly _obj: any) {}
    @doddlify
    pull() {
        return yaml.dump(this._obj)
    }
}

export function LocalObject(obj: object): DataSource_JsObject {
    return new _DataSource_JsObject(obj)
}
