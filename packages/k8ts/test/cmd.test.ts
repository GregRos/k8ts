import { Cmd } from "@lib"

describe("works", () => {
    const cm = Cmd("kubectl").flag("-x", "--y").option({
        "-n": "my-namespace",
        "--abc": true,
        "--num": 123,
        "--empty": "",
        "--equals=": "xyz",
        "-R ": "value",
        "-Z": null
    })

    it("works with default joiner", () => {
        expect(cm.toString()).toBe(
            `kubectl -x --y -n my-namespace --abc true --num 123 --empty "" --equals=xyz -R value`
        )
    })
    it("works with custom joiner", () => {
        expect(cm.joiner("=").toString()).toBe(
            `kubectl -x --y -n=my-namespace --abc=true --num=123 --empty="" --equals=xyz -R value`
        )
    })
})
