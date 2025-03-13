import { type DumpOptions } from "js-yaml"

export interface YamlSerializerOptions {
    jsYamlOptions: DumpOptions
}

export class BlueprintDisplayer {
    constructor(private readonly _options: Partial<YamlSerializerOptions>) {}

    async display(input: object) {}
}
