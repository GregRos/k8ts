import { MyPrettyError } from "./pretty-error"

process.on("uncaughtException", err => {
    const pe = MyPrettyError
    console.error(pe.render(err))
})

process.on("unhandledRejection", err => {
    const pe = MyPrettyError
    console.error(pe.render(err as Error))
})
