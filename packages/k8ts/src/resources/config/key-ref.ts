import type { ResourceRef } from "@k8ts/instruments"

export class ConfigKeyRef<Backend extends ResourceRef = ResourceRef, K extends string = string> {
    constructor(
        readonly backend: Backend,
        public readonly key: K
    ) {}
}
