import { ResourceTop } from "@k8ts/instruments"
import { v1 } from "../idents/default"
export interface NamespaceProps {}

export class Namespace<Name extends string = string> extends ResourceTop<Name, NamespaceProps> {
    constructor(name: Name, props: NamespaceProps = {}) {
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
