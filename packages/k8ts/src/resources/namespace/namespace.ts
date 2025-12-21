import { Origin_Entity, Resource_Top } from "@k8ts/instruments"
import { v1 } from "../../kinds/default"
import { build } from "../../world/k8ts-sys-kind"
export interface Namespace_Props {}

export class Namespace<Name extends string = string> extends Resource_Top<Name, Namespace_Props> {
    constructor(name: Name, props: Namespace_Props = {}) {
        super(name, props)
    }
    declare name: Name
    get kind() {
        return v1.Namespace._
    }

    protected body() {
        return {
            spec: {}
        }
    }
}

export class NamespaceOrigin extends Origin_Entity {
    get kind() {
        return build.current.Namespaced._
    }
}
