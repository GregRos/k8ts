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

    toDockerEnv() {
        return {
            PUID: this.id,
            PGID: this.group.id
        }
    }
}
