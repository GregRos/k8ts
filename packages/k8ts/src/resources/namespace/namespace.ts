import { ResourceTop, type Resource_Props_Top } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../resource-idents/default"
export interface NamespaceProps extends Resource_Props_Top<CDK.NamespaceSpec> {}

export class Namespace<Name extends string = string> extends ResourceTop<Name, NamespaceProps> {
    constructor(name: Name, props: NamespaceProps = {}) {
        super(name, props)
    }
    get ident() {
        return v1.Namespace._
    }

    protected __body__(): CDK.KubeNamespaceProps {
        const spec = {} satisfies CDK.NamespaceSpec
        const spec2 = merge(spec, this.props.$overrides)
        return {
            spec: spec2
        }
    }
}
