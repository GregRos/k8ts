import { register } from "tsconfig-paths"
register({
    baseUrl: `${__dirname}/..`,
    paths: {
        "@imports": ["./imports-dist"],
        "@lib": ["./dist"],
        "@lib/*": ["./dist/*"]
    }
})
