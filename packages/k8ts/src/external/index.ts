export class External<Kind extends string> {
    constructor(
        readonly kind: Kind,
        readonly name: string,
        readonly namespace?: string
    ) {}

    manifest() {
        return {
            kind: this.kind,
            name: this.name,
            namespace: this.namespace
        }
    }
}
