export function createTaggedTemplate<DataSource_T>(f: (joined: string) => DataSource_T) {
    return (tArgs: TemplateStringsArray, ...params: any[]) => {
        const joined = String.raw(tArgs, ...params)
        return f(joined)
    }
}
