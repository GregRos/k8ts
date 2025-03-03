import { meta, Meta } from "@lib"

it("accepts all valid value keys", () => {
    const m = Meta.from({
        "%label": "Hello",
        "%label2": "World",
        "^annotation": "goodbye",
        name: "x",
        namespace: "y"
    })
    expect(m.get("%label")).toBe("Hello")
    expect(m.get("%label2")).toBe("World")
    expect(m.get("^annotation")).toBe("goodbye")
    expect(m.get("name")).toBe("x")
    expect(m.get("namespace")).toBe("y")
})

it("accepts mix of value and section keys", () => {
    const m = meta({
        "%label": "Hello",
        "%label2": "World",
        "^annotation": "goodbye",
        name: "x",
        namespace: "y",
        "%x/": {
            label: "section label"
        }
    })
})
