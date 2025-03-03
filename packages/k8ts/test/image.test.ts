import { Image } from "@lib"

it("works", () => {
    const e = Image.host("xyz.com").image("abc").tag("1")
    expect(e.toString()).toBe("xyz.com/abc:1")
})
