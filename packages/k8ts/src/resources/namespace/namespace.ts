import { ManifestResource } from "@k8ts/instruments"
import { v1 } from "../../kinds/default"
export interface Namespace_Props {}

export class Namespace<Name extends string = string> extends ManifestResource<
    Name,
    Namespace_Props
> {
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
