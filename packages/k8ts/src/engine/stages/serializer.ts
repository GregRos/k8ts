import {
    K8tsManifest,
    ManifestSourceEmbedder,
    type ResourceNode,
    type ResourceTop
} from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import type EventEmitter from "eventemitter3"
import { dump, type DumpOptions } from "js-yaml"
import { K8tsEngineError } from "../error"

export interface YamlSerializerOptions {
    jsYamlOptions: DumpOptions
    emitter?: EventEmitter<any>
}
export interface SerializingEvent {
    manifest: K8tsManifest
    resource: ResourceNode
}
export interface SerializerEventsTable {
    serialize: SerializingEvent
}
export class Engine_Serializer_Yaml {
    constructor(private readonly _options: Partial<YamlSerializerOptions>) {}

    async serialize(input: K8tsManifest) {
        const node = ManifestSourceEmbedder.get(input).node
        this._options.emitter?.emit("serialize", {
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
                resource: node.entity as ResourceTop,
                manifest: input,
                content: result
            }
            node.origin.entity["__emit__"]("resource/serialized", e)
            return e.content
        } catch (err) {
            const resource = ManifestSourceEmbedder.get(input)
            throw new K8tsEngineError(`Failed to serialize manifest ${resource}`, {
                cause: err as Error
            })
        }
    }
}
