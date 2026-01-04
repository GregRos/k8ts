import { ImageRegistry } from "@lib"

it("works", () => {
    const e = ImageRegistry("xyz.com").namespace().repo("abc").tag("1")
    expect(e.toString()).toBe("xyz.com/abc:1")
})
