import { BaseManifest, ManifestSourceEmbedder } from "@k8ts/instruments"
import Emittery from "emittery"
import { dump, type DumpOptions } from "js-yaml"
import { CDK } from "../../_imports"
import { MakeError } from "../../error"

export interface YamlSerializerOptions {
    jsYamlOptions: DumpOptions
}
export interface SerializingEvent {
    manifest: BaseManifest
}
export interface YamlSerializerEventsTable {
    serialize: SerializingEvent
}
export class YamlSerializer extends Emittery<YamlSerializerEventsTable> {
    constructor(private readonly _options: Partial<YamlSerializerOptions>) {
        super()
    }

    async serialize(input: BaseManifest) {
        await this.emit("serialize", { manifest: input })

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
            return result
        } catch (err) {
            const resource = ManifestSourceEmbedder.get(input)
            throw new MakeError(`Failed to serialize manifest ${resource?.shortFqn ?? "???"}`, {
                cause: err
            })
        }
    }
}
