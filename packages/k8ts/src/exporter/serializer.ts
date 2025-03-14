import Emittery from "emittery"
import { dump, type DumpOptions } from "js-yaml"
import { BaseManifest } from "../manifest"

export interface YamlSerializerOptions {
    jsYamlOptions: DumpOptions
}
export interface SerializingEvent {
    manifest: BaseManifest
}
export interface YamlSerializerEventsTable {
    serializing: SerializingEvent
}
export class YamlSerializer extends Emittery<YamlSerializerEventsTable> {
    constructor(private readonly _options: Partial<YamlSerializerOptions>) {
        super()
    }

    async serialize(input: BaseManifest) {
        await this.emit("serializing", { manifest: input })

        const result = dump(input, {
            lineWidth: 800,
            noArrayIndent: true,
            indent: 2,
            ...this._options.jsYamlOptions,
            noRefs: true
        })
        return result
    }
}
