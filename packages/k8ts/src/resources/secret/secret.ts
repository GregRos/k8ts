import type { Meta } from "@k8ts/metadata"

export interface SecretProps {
    data: Record<string, string>
    stringData: Record<string, string>
}

export class Secret {
    kind = "Secret" as const
    get name() {
        return this.meta.get("name")
    }
    constructor(
        readonly meta: Meta,
        readonly props: SecretProps
    ) {}
}
