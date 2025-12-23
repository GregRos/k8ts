import type { Ref2_Of } from "@k8ts/instruments"

export class ConfigKeyRef<Backend extends Ref2_Of = Ref2_Of, K extends string = string> {
    constructor(
        readonly backend: Backend,
        public readonly key: K
    ) {}
}
