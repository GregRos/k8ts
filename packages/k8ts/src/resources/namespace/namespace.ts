import { K8sResource, type Resource_Props_Top } from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../gvks/default"
export interface NamespaceProps extends Resource_Props_Top<K8S.NamespaceSpec> {}

export class Namespace<Name extends string = string> extends K8sResource<Name, NamespaceProps> {
    constructor(name: Name, props: NamespaceProps = {}) {
        super(name, props)
    }
    get kind() {
        return v1.Namespace._
    }

    protected __body__(): K8S.KubeNamespaceProps {
        const spec = {} satisfies K8S.NamespaceSpec
        const spec2 = merge(spec, this.props.$overrides)
        return {
            spec: spec2
        }
    }
}
