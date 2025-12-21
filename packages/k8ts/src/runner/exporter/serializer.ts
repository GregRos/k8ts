import { CDK } from "@k8ts/imports"
import {
    Manifest,
    ManifestSourceEmbedder,
    type Resource_Node,
    type Resource_Top
} from "@k8ts/instruments"
import Emittery from "emittery"
import { dump, type DumpOptions } from "js-yaml"
import { MakeError } from "../../error"

export interface YamlSerializerOptions {
    jsYamlOptions: DumpOptions
}
export interface SerializingEvent {
    manifest: Manifest
    resource: Resource_Node
}
export interface SerializerEventsTable {
    serialize: SerializingEvent
}
export class YamlSerializer extends Emittery<SerializerEventsTable> {
    constructor(private readonly _options: Partial<YamlSerializerOptions>) {
        super()
    }

    async serialize(input: Manifest) {
        const node = ManifestSourceEmbedder.get(input).node
        await this.emit("serialize", {
            manifest: input,
            resource: node
        })

        try {
            const result = dump(input, {
                lineWidth: 800,
                noArrayIndent: true,
                indent: 2,
                replacer(key, value) {
                    if (value instanceof CDK.IntOrString) {
                        return value.value
                    }
                    if (value instanceof CDK.Quantity) {
                        return value.value
                    }
                    return value
                },
                ...this._options.jsYamlOptions,
                noRefs: true
            })
            const e = {
                origin: node.origin.entity,
                resource: node.entity as Resource_Top,
                manifest: input,
                content: result
            }
            node.origin.entity["__emit__"]("resource/serialized", e)
            return e.content
        } catch (err) {
            const resource = ManifestSourceEmbedder.get(input)
            throw new MakeError(`Failed to serialize manifest ${resource}`, {
                cause: err
            })
        }
    }
}
