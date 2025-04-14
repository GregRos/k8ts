export class Group {
    constructor(
        readonly id: number,
        readonly name: string
    ) {}
}
export class User {
    constructor(
        readonly id: number,
        readonly name: string,
        readonly group: Group
    ) {}

    static makeSync(id: number, name: string) {
        return new User(id, name, new Group(id, name))
    }

    toDockerEnv(prefix = "P") {
        return {
            [`${prefix}UID`]: this.id,
            [`${prefix}GID`]: this.group.id
        }
    }
}
