import Tag from "./Tag.js"
import Comment from "./Comment.js"

class Text {
	#text
	#parent = null
	#siblings = { previous: null, next: null }

	constructor(text) {
		if (typeof text !== "string") throw new TypeError(`Expected text to be a string`)

		this.#text = text
	}

	static isText(node) {
		return node instanceof Text
	}

	static isNode(node) {
		return node instanceof Tag || node instanceof Text || node instanceof Comment
	}

	get TOM() {
		return {
			text: this.#text,
			parent: this.#parent,
			siblings: Object.freeze({ ...this.#siblings }),
		}
	}

	get text() {
		return this.#text
	}

	set text(newText) {
		this.#validateStringInput(newText, "newText")

		this.#text = newText
	}

	get parent() {
		return this.#parent
	}

	set parent(node) {
		this.#validateChildInput(node, "node", true)

		this.#parent = node
	}

	get previousSibling() {
		return this.#siblings.previous
	}

	set previousSibling(node) {
		this.#validateChildInput(node, "node", true)

		this.#siblings.previous = node
	}

	get nextSibling() {
		return this.#siblings.next
	}

	set nextSibling(node) {
		this.#validateChildInput(node, "node", true)

		this.#siblings.next = node
	}

	#validateStringInput(string, argName = "argument", emptyAllowed = true, trim = false) {
		if (typeof string !== "string") throw new TypeError(`Expected ${argName} to be a string`)
		if (!emptyAllowed) {
			if (trim) string = string.trim()
			if (string.length === 0) throw new TypeError(`Expected ${argName} to be a non-empty string`)
		}
	}

	#validateChildInput(child, argName = "argument", nullAllowed = false) {
		if (!nullAllowed && child === null) {
			throw new TypeError(
				`Expected ${argName} to be an instance of Tag, Text, or Comment. null is not allowed`,
			)
		}
		if (child !== null && !Tag.isTag(child) && !Text.isText(child) && !Comment.isComment(child)) {
			throw new TypeError(`Expected ${argName} to be an instance of Tag, Text, or Comment`)
		}
	}

	clone() {
		return new Text(this.text)
	}

	isSiblingOf(node) {
		this.#validateChildInput(node, "node")

		return node.previousSibling === this || node.nextSibling === this
	}

	isParentOf(node) {
		return false
	}

	isChildOf(node) {
		this.#validateChildInput(node, "node")

		return this.parent === node
	}
}

export default Text
