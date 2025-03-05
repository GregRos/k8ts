class _ApiGroup<const ApiGroup extends string = string> {
    constructor(readonly apiGroup: ApiGroup) {}

    version<ApiVersion extends string>(apiVersion: ApiVersion) {
        return new _ApiVersion(this, apiVersion)
    }

    get text() {
        return this.apiGroup
    }

    toString() {
        return this.text
    }
}

class _ApiVersion<
    const ApiGroup extends string = string,
    const ApiVersion extends string = string
> {
    constructor(
        readonly apiGroup: _ApiGroup<ApiGroup>,
        readonly apiVersion: ApiVersion
    ) {}

    kind<Kind extends string>(kind: Kind) {
        return new Api.Kind(this, kind)
    }

    get text() {
        const arr = []
        if (this.apiGroup.text) {
            arr.push(this.apiGroup.text)
        }
        arr.push(this.apiVersion)
        return arr.join("/")
    }

    toString() {
        return this.text
    }
}

export namespace Api {
    export function group<ApiGroup extends string>(apiGroup: ApiGroup) {
        return new _ApiGroup(apiGroup)
    }

    export class Kind<
        const ApiGroup extends string = string,
        const ApiVersion extends string = string,
        const Kind extends string = string
    > {
        constructor(
            readonly apiVersion: _ApiVersion<ApiGroup, ApiVersion>,
            readonly kind: Kind
        ) {}

        get version() {
            return this.apiVersion.text
        }

        get text() {
            return `${this.apiVersion}/${this.kind}`
        }

        toString() {
            return this.text
        }
    }
}
