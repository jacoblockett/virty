// DESIGN NOTE: This library makes no attempt at validating the data it receives beyond ensuring it abides
// by this api's ability to interpret the data. For instance, "<" is perfectly acceptable within a text node,
// whereas in reality that's obviously disallowed. Validation is out of scope for this library and should be
// handled in the calling library.

// TODO: Replace "PKG" with the actual package name whenever you think of one.

const getChildren = Symbol("getChildren")
const setNext = Symbol("setNext")
const setParent = Symbol("setParent")
const setPrevious = Symbol("setPrevious")

export const COMMENT = "comment"
export const ELEMENT = "element"
export const TEXT = "text"

export default class Node {
	#attributes
	#children
	#connections // just an idea to be able to connect two nodes to each other so that what happens to one happens to the other as well
	#next
	#parent
	#previous
	#tagName
	#type
	#value

	/**
	 * Creates a new Node - a representation similar to that of a DOM node.
	 *
	 * @param {object} init (Required)
	 * @param {"comment"|"element"|"text"} init.type (Required) Case-*in*sensitive type of the node
	 * @param {string} [init.tagName] (Optional) Case-sensitive tag name, e.g. `"img"` for `<img />`. `"comment"` and `"text"` nodes will ignore this option
	 * @param {{[name: string]: string|number|boolean}} [init.attributes] (Optional) Attributes to use with `"element"` nodes. Attribute keys are case-sensitive. `"comment"` and `"text"` nodes will ignore this option
	 * @param {Node[]} [init.children] (Optional) Children to immediately populate the node with. `"comment"` and `"text"` nodes will ignore this option
	 * @param {string} [init.value] (Optional) The text to use for `"comment"` and `"text"` nodes. This is not the same as the `value` attribute. To set that, use the `init.attributes` option. `"element"` nodes will ignore this option
	 */
	constructor(init = {}) {
		if (Object.prototype.toString.call(init) !== "[object Object]")
			throw new TypeError("Expected 'init' to be an object")
		if (typeof init.type !== "string") throw new TypeError("Expected 'init.type' to be a string")

		init.type = init.type.toLowerCase()

		if (init.type !== COMMENT && init.type !== ELEMENT && init.type !== TEXT)
			throw new TypeError(`Expected 'init.type' to be one of "comment", "element", or "text"`)

		this.#type = init.type

		if (init.type === ELEMENT) {
			if (typeof init.tagName !== "string") init.tagName = ""

			this.#tagName = init.tagName

			if (Object.prototype.toString.call(init.attributes) !== "[object Object]") init.attributes = {}

			for (const [key, val] of Object.entries(init.attributes))
				if (typeof val !== "string" && typeof val !== "number" && typeof val !== "boolean")
					throw new TypeError(`Expected init.attributes.${key} to be string|number|boolean`)

			this.#attributes = init.attributes
			this.#children = []

			if (Array.isArray(init.children) && init.children.length) this.appendChild(init.children)
		} else if (init.type === COMMENT) {
			if (typeof init.value !== "string") init.value = ""
			else init.value = init.value.trim()

			const iv = init.value
			const ivl = iv.length

			if (
				ivl &&
				(iv[0] !== "<" ||
					iv[1] !== "!" ||
					iv[2] !== "-" ||
					iv[3] !== "-" ||
					iv[ivl - 3] !== "-" ||
					iv[ivl - 2] !== "-" ||
					iv[ivl - 1] !== ">")
			)
				init.value = `<!--${init.value}-->`

			this.#value = init.value
		} else if (init.type === TEXT) {
			if (typeof init.value !== "string") init.value = ""

			this.#value = init.value
		}
	}

	/**
	 * Checks if the given value is a comment node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isComment(value) {
		return value instanceof Node && value.type === COMMENT
	}

	/**
	 * Checks if the given value is an element node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isElement(value) {
		return value instanceof Node && value.type === ELEMENT
	}

	/**
	 * Checks if the given value is a node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isNode(value) {
		return value instanceof Node
	}

	/**
	 * Checks if the given value is a text node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isText(value) {
		return value instanceof Node && value.type === TEXT
	}

	/**
	 * ⚠️ Protected member. Gets the unfrozen reference to the node's children.
	 *
	 * @protected
	 * @returns {Node[]|undefined}
	 */
	[getChildren]() {
		return this.#children
	}

	/**
	 *  ⚠️ Protected member. Sets the next sibling reference of the node. This method
	 * assumes no responsibility of updating any affected siblings. That responsibility
	 * lies solely with the caller.
	 *
	 * @protected
	 * @param {Node|undefined}
	 * @returns {void}
	 */
	[setNext](node) {
		if (node !== undefined && !(node instanceof Node)) throw new TypeError("Expected 'next' to be a Node or undefined")

		this.#next = node
	}

	/**
	 *  ⚠️ Protected member. Sets the parent reference of the node. This method
	 * assumes no responsibility of updating any affected parents/children. That responsibility
	 * lies solely with the caller.
	 *
	 * @protected
	 * @param {Node|undefined}
	 * @returns {void}
	 */
	[setParent](node) {
		if (node !== undefined && (!(node instanceof Node) || node.type !== "element"))
			throw new TypeError("Expected 'parent' to be an element Node or undefined")

		this.#parent = node
	}

	/**
	 *  ⚠️ Protected member. Sets the previous sibling reference of the node. This method
	 * assumes no responsibility of updating any affected siblings. That responsibility
	 * lies solely with the caller.
	 *
	 * @protected
	 * @param {Node|undefined}
	 * @returns {void}
	 */
	[setPrevious](node) {
		if (node !== undefined && !(node instanceof Node))
			throw new TypeError("Expected 'previous' to be a Node or undefined")

		this.#previous = node
	}

	/**
	 * The attributes of the node. `"comment"` and `"text"` nodes do not have an attributes member.
	 *
	 * @returns {{[name: string]: string|number|boolean}|undefined}
	 */
	get attributes() {
		return this.#attributes ? Object.freeze({ ...this.#attributes }) : undefined
	}

	/**
	 * The children of the node. `"comment"` and `"text"` nodes do not have a children member.
	 *
	 * @returns {Node[]|undefined}
	 */
	get children() {
		return this.#children ? Object.freeze([...this.#children]) : undefined
	}

	/**
	 * The next sibling node.
	 *
	 * @returns {Node|undefined}
	 */
	get next() {
		return this.#next
	}

	/**
	 * The parent node.
	 *
	 * @returns {Node|undefined}
	 */
	get parent() {
		return this.#parent
	}

	/**
	 * The previous sibling node.
	 *
	 * @returns {Node|undefined}
	 */
	get previous() {
		return this.#previous
	}

	/**
	 * The root node.
	 *
	 * @returns {Node}
	 */
	get root() {
		let qNode = this

		while (true) {
			if (!qNode.parent) return qNode
			qNode = qNode.parent
		}
	}

	/**
	 * The tag name of the node. `"comment"` and `"text"` nodes do not have a tagName member.
	 *
	 * @returns {string|undefined}
	 */
	get tagName() {
		return this.#tagName
	}

	/**
	 * The type of the node.
	 *
	 * @returns {"comment"|"element"|"text"}
	 */
	get type() {
		return this.#type
	}

	/**
	 * The value of the node. `"element"` nodes do not have a value member.
	 *
	 * @note This is not the same as the value attribute.
	 *
	 * @returns {string|undefined}
	 */
	get value() {
		return this.#value
	}

	/**
	 * Appends the given child or children to the node. You can pass multiple nodes as arguments or an array of nodes.
	 * Appended children will lose any and all parent and sibling references should they already exist. Nodes of type
	 * "comment" and "text" will do nothing.
	 *
	 * @param {...Node|Node[]} nodes The child or children to append
	 * @returns {Node} The instance itself for chaining
	 */
	appendChild(...nodes) {
		if (this.#type !== ELEMENT) return this
		if (nodes.length === 1 && Array.isArray(nodes[0])) nodes = nodes[0]

		let p = this.#children[this.#children.length - 1]

		for (let c of nodes) {
			if (!(c instanceof Node)) throw new TypeError("Expected '...nodes' to only contain Nodes")
			if (c.parent) c.parent.removeChild(c)

			c[setParent](this)

			if (p instanceof Node) {
				p[setNext](c)
				c[setPrevious](p)
			}

			this.#children.push(c)
			p = c
		}

		return this
	}

	/**
	 * Appends the given sibling or siblings to the node. You can pass multiple nodes as arguments or an array of nodes.
	 * Appended siblings will lose any and all parent and sibling references should they already exist.
	 *
	 * @param {...Node|Node[]} nodes The sibling or siblings to append
	 * @returns {Node} The instance itself for chaining
	 */
	appendSibling(...nodes) {
		if (nodes.length === 1 && Array.isArray(nodes[0])) nodes = nodes[0]
		if (!this.#parent) throw new Error("Cannot append a siblings to nodes without a parent (root nodes)")

		const p = this.#parent
		const pc = p[getChildren]()

		if (pc[pc.length - 1] === this) {
			this.#parent.appendChild(...nodes)
			return this
		}

		pc.splice(pc.indexOf(this) + 1, 0, ...nodes)

		for (let i = 0; i < pc.length; i++) {
			const c = pc[i]

			if (!(c instanceof Node)) throw new TypeError("Expected ...nodes to only contain Nodes")

			c[setParent](p)
			c[setPrevious](pc[i - 1])
			c[setNext](pc[i + 1])
		}

		return this
	}

	/**
	 * Removes the given child or children from the node. You can pass multiple nodes as arguments or an array of
	 * nodes. Nodes of type "comment" and "text", and nodes with no children, will do nothing.
	 *
	 * @param {...Node|Node[]} nodes The child or children to remove
	 * @returns {Node} The instance itself for chaining
	 */
	removeChild(...nodes) {
		if (this.#type !== ELEMENT || !this.#children.length) return this
		if (nodes.length === 1 && Array.isArray(nodes[0])) nodes = nodes[0]

		const remaining = []

		for (const c of this.#children) {
			if (!nodes.includes(c)) {
				remaining.push(c)
				continue
			}

			if (c.previous) c.previous[setNext](c.next)
			if (c.next) c.next[setPrevious](c.previous)

			c[setNext](undefined)
			c[setParent](undefined)
			c[setPrevious](undefined)
		}

		this.#children = remaining

		return this
	}
}
