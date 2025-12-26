import type { Rsc_Ref } from "@k8ts/instruments"

export class ConfigKeyRef<Backend extends Rsc_Ref = Rsc_Ref, K extends string = string> {
    constructor(
        readonly backend: Backend,
        public readonly key: K
    ) {}
}
