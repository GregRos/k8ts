import { ResourceTop } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { v1 } from "../../gvks"
import { PodTemplate, PodTemplate_Props } from "./template/pod-template"
export class Pod<Name extends string, Ports extends string = string> extends ResourceTop<
    Name,
    PodTemplate_Props<Ports>
> {
    get kind() {
        return v1.Pod._
    }

    @doddlify
    get Template() {
        const podTemplate = new PodTemplate(this, this.ident.name, this.props)
        return podTemplate
    }

    get ports() {
        return this.Template.ports
    }
    protected __kids__() {
        return [this.Template]
    }

    protected __body__(): CDK.KubePodProps {
        // The template's metadata and other stuff will get erased in favor of the Pod's own
        // metadata and gvk
        return this.Template["__submanifest__"]()
    }
}
