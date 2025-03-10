export namespace Kind {
    export type InputVersion = `v${string}`
    export class _Version<
        const Group extends string = string,
        const Name extends InputVersion = InputVersion
    > {
        constructor(
            readonly group: _Group<Group>,
            readonly version: Name
        ) {}

        kind<Kind extends string>(kind: Kind) {
            return new Kind(this, kind)
        }

        get text() {
            const arr = []
            if (this.group.text) {
                arr.push(this.group.text)
            }
            arr.push(this.version)
            return arr.join("/")
        }

        toString() {
            return this.text
        }
    }
    class _Group<const Name extends string = string> {
        constructor(readonly apiGroup: Name) {}

        version<Version extends InputVersion>(apiVersion: Version) {
            return new _Version(this, apiVersion)
        }

        get text() {
            return this.apiGroup
        }

        toString() {
            return this.text
        }
    }

    export class Kind<
        const Group extends string = string,
        const V extends InputVersion = InputVersion,
        const Name extends string = string
    > {
        constructor(
            readonly apiVersion: _Version<Group, V>,
            readonly kind: Name
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

        subkind<Subkind extends string>(namespace: string, name: string, subkind: Subkind) {
            return new Kind(this.apiVersion, `${this.kind}.${subkind}`)
        }
    }

    export class SubKind<K extends Kind> {
        constructor(
            readonly kind: K,
            readonly namespace: string,
            readonly parentName: string,
            readonly name: string
        ) {}
    }

    export function group<ApiGroup extends string>(apiGroup: ApiGroup) {
        return new _Group(apiGroup)
    }

    export function version<ApiVersion extends InputVersion>(apiVersion: ApiVersion) {
        return new _Version(group(""), apiVersion)
    }
}
