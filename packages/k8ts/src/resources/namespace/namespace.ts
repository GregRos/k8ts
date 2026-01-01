import { Rsc_Top } from "@k8ts/instruments"
import { v1 } from "../../idents/default"
export interface Namespace_Props {}

export class Namespace<Name extends string = string> extends Rsc_Top<Name, Namespace_Props> {
    constructor(name: Name, props: Namespace_Props = {}) {
        super(name, props)
    }
    declare name: Name
    get ident() {
        return v1.Namespace._
    }

    protected body() {
        return {
            spec: {}
        }
    }
}
