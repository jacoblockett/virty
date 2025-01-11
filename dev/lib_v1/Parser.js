import EventEmitter from "node:events"

class Parser extends EventEmitter {
	constructor() {
		super()
	}

	parse(data) {
		let tagState = 0 // 0 = no declarations, 1 = open declaration, 2 = close declaration
		let attrState = 0 // 0 = no declarations, 1 = key declaration, 2 = value declaration
		let attributes = {}
		let attrName = ""
		let attrValue = ""
		let tagName = ""
		let text = ""

		const assignAttribute = () => {
			if (attrName && attrValue) {
				attributes[attrName] = attrValue.replace(/^['"]|['"]$/g, "")
				this.emit("attribute", attrName, attributes[attrName])
			}
			attrName = ""
			attrValue = ""
		}

		const resetState = () => {
			tagState = 0
			attrState = 0
			attributes = {}
			attrName = ""
			attrValue = ""
			tagName = ""
			text = ""
		}

		for (let i = 0; i < data.length; i++) {
			const char = data[i]

			switch (char) {
				case "<":
					if (tagState === 1)
						throw new Error(`Invalid HTML/XML: Found an opening bracket '<' within a tag declaration at ${i}`)

					tagState = 1

					if (text.length) {
						this.emit("text", text)
						text = ""
					}

					break
				case "/":
					if (tagState === 1) {
						tagState = 2
					}

					break
				case ">":
					if (tagState === 1) {
						assignAttribute()
						this.emit("tagOpen", tagName, attributes)
						resetState()
					} else if (tagState === 2) {
						this.emit("tagClose", tagName)
						tagState = 0
						tagName = ""
					}

					break
				case " ":
					if (tagState === 1) {
						attrState = 1
						assignAttribute(i)
					} else {
						text += char
					}

					break
				case "=":
					if (tagState === 1 && attrState === 1) {
						attrState = 2
					} else if (tagState === 1) {
						throw new Error(`Invalid data: Found an assignment with no attribute name at ${i}`)
					} else {
						text += char
					}

					break
				default:
					if (tagState === 1 && attrState === 1) {
						attrName += char
					} else if (tagState === 1 && attrState === 2) {
						attrValue += char
					} else if (tagState > 0) {
						tagName += char
					} else {
						text += char
					}

					break
			}
		}
	}
}

export default Parser
