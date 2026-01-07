import { toHashTable } from "alltheutils"
import DoctypeDeclaration from "./declarations/doctype.js"
import XmlDeclaration from "./declarations/xml.js"
import { setNext, setParent, setPrevious } from "./keyMask.js"
import { Document, Element, VoidElement, CDATA, ProcessingInstruction, Text, Comment } from "./nodeTypes.js"

/**
 * @typedef {import('./nodeTypes.js').Document} Virty.Document
 * @typedef {import('./nodeTypes.js').Element} Virty.Element
 * @typedef {import('./nodeTypes.js').VoidElement} Virty.VoidElement
 * @typedef {import('./nodeTypes.js').CDATA} Virty.CDATA
 * @typedef {import('./nodeTypes.js').ProcessingInstruction} Virty.ProcessingInstruction
 * @typedef {import('./nodeTypes.js').Text} Virty.Text
 * @typedef {import('./nodeTypes.js').Comment} Virty.Comment
 */

export default class Node {
	#attributes = {}
	#children = []
	#doctypeDeclaration
	#name = ""
	#next
	#parent
	#previous
	#type
	#value = ""
	#xmlDeclaration

	/**
	 * @param {object} init
	 * @param {Virty.Document|Virty.Element|Virty.VoidElement|Virty.CDATA|Virty.ProcessingInstruction|Virty.Text|Virty.Comment} init.type The type of the Node
	 * @param {XmlDeclaration} [init.xmlDeclaration] The XML declaration of the Document Node
	 * @param {DoctypeDeclaration} [init.doctypeDeclaration] The Doctype declaration of the Document Node
	 * @param {string} [init.name] The name of the Element, VoidElement, or ProcessingInstruction Node
	 * @param {{[name: string]: string}} [init.attributes] Attributes to assign to the Element or VoidElement Node
	 * @param {Node[]} [init.children] Children of the Document or Element Node
	 * @param {string} [init.value] Raw text data of the CDATA, ProcessingInstruction, Text, or Comment Node
	 */
	constructor(init) {
		if (Object.prototype.toString.call(init) !== "[object Object]")
			throw new TypeError(`Expected init to be an object, instead got ${typeof init}`)

		this.#type = init.type

		switch (init.type) {
			case Document:
				if (init.xmlDeclaration) this.setXmlDeclaration(init.xmlDeclaration)
				if (init.doctypeDeclaration) this.setDoctypeDeclaration(init.doctypeDeclaration)
				if (init.children) this.appendChild(init.children)
				break
			case Element:
				if (init.name) this.setName(init.name)
				if (init.attributes) this.setAttributes(init.attributes)
				if (init.children) this.appendChild(init.children)
				break
			case VoidElement:
				if (init.name) this.setName(init.name)
				if (init.attributes) this.setAttributes(init.attributes)
				break
			case CDATA:
			case ProcessingInstruction:
			case Text:
			case Comment:
				if (init.value) this.setValue(init.value)
				break
			default:
				throw new Error(`Node type ${init.type} is not a registered Node type`)
		}
	}

	/**
	 * Checks if the given value is a CDATA Node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isCDATA(value) {
		return value instanceof Node && value.type === CDATA
	}

	/**
	 * Checks if the given value is a character data Node.
	 *
	 * @note This is not referring to CDATA Nodes, but instead all raw text/character.
	 * data Nodes (CDATA, Comment, ProcessingInstruction, Text)
	 * @see `Node.isCDATA` Checks if the given value is a CDATA Node.
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isCharacterData(value) {
		const characterDataNodeTypesMap = { 3: true, 4: true, 5: true, 6: true }

		return value instanceof Node && characterDataNodeTypesMap[value.type]
	}

	/**
	 * Checks if the given value is a Comment Node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isComment(value) {
		return value instanceof Node && value.type === Comment
	}

	/**
	 * Checks if the given value is a Document Node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isDocument(value) {
		return value instanceof Node && value.type === Document
	}

	/**
	 * Checks if the given value is an Element Node.
	 *
	 * @note Element and VoidElement are both Element Nodes.
	 * @see `isNonVoidElement` Checks if the given value is a non-void Element Node
	 * @see `isVoidElement` Checks if the given value is a VoidElement Node.
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isElement(value) {
		return value instanceof Node && (value.type === Element || value.type === VoidElement)
	}

	/**
	 * Checks if the given value is a Node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isNode(value) {
		return value instanceof Node
	}

	/**
	 * Checks if the given value is a non-void Element Node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isNonVoidElement(value) {
		return value instanceof Node && value.type === Element
	}

	/**
	 * Checks if the given value is a ProcessingInstruction Node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isProcessingInstruction(value) {
		return value instanceof Node && value.type === ProcessingInstruction
	}

	/**
	 * Checks if the given value is a Text Node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isText(value) {
		return value instanceof Node && value.type === Text
	}

	/**
	 * Checks if the given value is a VoidElement Node.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isVoidElement(value) {
		return value instanceof Node && value.type === VoidElement
	}

	/**
	 *  ⚠️ This method is protected and should be used internally by Virty **only**.
	 *
	 * Sets the next sibling reference of the node.
	 *
	 * @note This method assumes no responsibility of updating any affected siblings.
	 * @protected
	 * @param {Node|undefined}
	 * @returns {void}
	 */
	[setNext](node) {
		if (node !== undefined && !Node.isNode(node))
			throw new TypeError(`Expected node to be one of Node|undefined, instead got ${typeof node}`)

		this.#next = node
	}

	/**
	 *  ⚠️ This method is protected and should be used internally by Virty **only**.
	 *
	 * Sets the parent reference of the node.
	 *
	 * @note This method assumes no responsibility of updating any affected parents/children.
	 * @protected
	 * @param {Node|undefined}
	 * @returns {void}
	 */
	[setParent](node) {
		if (node !== undefined) {
			if (!Node.isNode(node))
				throw new TypeError(`Expected node to be one of Node|undefined, instead got ${typeof node}`)
			if (!node.canContainChildren)
				throw new TypeError(`Expected node to be a Node that can contain children, instead got ${node.type} Node`)
		}

		this.#parent = node
	}

	/**
	 *  ⚠️ This method is protected and should be used internally by Virty **only**.
	 *
	 * Sets the previous sibling reference of the node.
	 *
	 * @note This method assumes no responsibility of updating any affected siblings.
	 * @protected
	 * @param {Node|undefined}
	 * @returns {void}
	 */
	[setPrevious](node) {
		if (node !== undefined && !Node.isNode(node))
			throw new TypeError(`Expected node to be one of Node|undefined, instead got ${typeof node}`)

		this.#previous = node
	}

	/**
	 * The attributes of this Node.
	 *
	 * @returns {{[name: string]: string|number|boolean}}
	 */
	get attributes() {
		return { ...this.#attributes }
	}

	/**
	 * Checks if this Node is allowed to contain children.
	 *
	 * @note Nodes allowed children are Document and Element.
	 * @returns {boolean}
	 */
	get canContainChildren() {
		return this.#type === Document || this.#type === Element
	}

	/**
	 * Concatenates and returns all text content from character data Nodes within this Node and its descendants.
	 *
	 * @note Character data Nodes constitute CDATA, Comment, ProcessingInstruction, and Text Nodes.
	 * @note (HTML) Semantically invisible Text Nodes will also be rendered within the resulting string.
	 * @see `text` Concatenates and returns all text content from Text Nodes within this Node and its descendants.
	 * @returns {string}
	 */
	get characterData() {
		if (Node.isCharacterData(this)) return this.#value

		let result = ""

		const stack = [{ node: this, remainingChildren: [...this.#children] }]

		while (stack.length) {
			const { node, remainingChildren } = stack.shift()

			if (Node.isCharacterData(node)) {
				result = `${result}${node.value}`
				continue
			}

			while (remainingChildren.length) {
				const child = remainingChildren.shift()

				if (child.children?.length) {
					if (remainingChildren.length) stack.unshift({ node, remainingChildren })

					stack.unshift({ node: child, remainingChildren: [...child.children] })
				} else if (Node.isCharacterData(child.type)) {
					result = `${result}${child.value}`
				}
			}
		}

		return result
	}

	/**
	 * The children of this Node.
	 *
	 * @returns {Node[]}
	 */
	get children() {
		return this.#children
	}

	/**
	 * The DOCTYPE declaration of this Node.
	 *
	 * @returns {DoctypeDeclaration|undefined}
	 */
	get doctypeDeclaration() {
		return this.#doctypeDeclaration
	}

	/**
	 * The first child of this Node.
	 *
	 * @returns {Node|undefined}
	 */
	get firstChild() {
		return this.#children[0]
	}

	/**
	 * Checks if this Node is a child of another Node.
	 *
	 * @returns {boolean}
	 */
	get isChild() {
		return !!this.#parent
	}

	/**
	 * Checks if this Node is the first child of another Node.
	 *
	 * @returns {boolean}
	 */
	get isFirstChild() {
		return this.#parent?.firstChild === this
	}

	/**
	 * Checks if this Node is a grandchild to another Node.
	 *
	 * @returns {boolean}
	 */
	get isGrandchild() {
		return !!this.#parent?.parent
	}

	/**
	 * Checks if this Node is a grandparent to another Node.
	 *
	 * @returns {boolean}
	 */
	get isGrandparent() {
		if (!this.#children.length) return false

		for (const child of this.#children) {
			if (!Node.isNode(child)) continue
			if (child.children.length) return true
		}

		return false
	}

	/**
	 * Checks if this Node is the last child of another Node.
	 *
	 * @returns {boolean}
	 */
	get isLastChild() {
		return this.#parent?.lastChild === this
	}

	/**
	 * Checks if this Node is the only child of another Node.
	 *
	 * @returns {boolean}
	 */
	get isOnlyChild() {
		return this.#parent?.children?.length === 1
	}

	/**
	 * Checks if this Node is a parent to another Node.
	 *
	 * @returns {boolean}
	 */
	get isParent() {
		return !!this.#children.length
	}

	/**
	 * Checks if this Node is a sibling of another Node.
	 *
	 * @returns {boolean}
	 */
	get isSibling() {
		return this.#parent?.children?.length > 1
	}

	/**
	 * The next sibling after this Node.
	 *
	 * @returns {Node|undefined}
	 */
	get next() {
		return this.#next
	}

	/**
	 * The first child Node of this Node's parent Node.
	 *
	 * @returns {Node|undefined}
	 */
	get oldestSibling() {
		return this.#parent?.firstChild
	}

	/**
	 * The parent to this Node.
	 *
	 * @returns {Node|undefined}
	 */
	get parent() {
		return this.#parent
	}

	/**
	 * The previous sibling before this Node.
	 *
	 * @returns {Node|undefined}
	 */
	get previous() {
		return this.#previous
	}

	/**
	 * The last child of this Node.
	 *
	 * @returns {Node|undefined}
	 */
	get lastChild() {
		return this.#children[this.children.length - 1]
	}

	/**
	 * The root, or highest ancestor of this Node.
	 *
	 * @returns {Node}
	 */
	get root() {
		let n = this

		while (true) {
			if (!n.parent) return n
			n = n.parent
		}
	}

	/**
	 * The name of this Node.
	 *
	 * @returns {string}
	 */
	get name() {
		return this.#name
	}

	/**
	 * Concatenates and returns all text content from Text Nodes within this Node and its descendants.
	 *
	 * @note This retrieves only Text Node content and ignores all other Nodes.
	 * @note (HTML) Semantically invisible Text Nodes will also be rendered within the resulting string.
	 * @see `characterData` Gets text from all character data nodes (Comment, CDATA, ProcessingInstruction, Text)
	 * @returns {string}
	 */
	get text() {
		if (this.#type === Text) return this.#value

		let result = ""

		const stack = [{ node: this, remainingChildren: [...this.#children] }]

		while (stack.length) {
			const { node, remainingChildren } = stack.shift()

			if (node.type === Text) {
				result = `${result}${node.value}`
				continue
			}

			while (remainingChildren.length) {
				const child = remainingChildren.shift()

				if (child.children?.length) {
					if (remainingChildren.length) stack.unshift({ node, remainingChildren })

					stack.unshift({ node: child, remainingChildren: [...child.children] })
				} else if (child.type === Text) {
					result = `${result}${child.value}`
				}
			}
		}

		return result
	}

	/**
	 * The type of this Node.
	 *
	 * @returns {Virty.Document|Virty.Element|Virty.VoidElement|Virty.CDATA|Virty.ProcessingInstruction|Virty.Text|Virty.Comment}
	 */
	get type() {
		return this.#type
	}

	/**
	 * The type of this Node as text.
	 *
	 * @returns {"Document"|"Element"|"VoidElement"|"CDATA"|"ProcessingInstruction"|"Text"|"Comment"}
	 */
	get typeText() {
		return ["Document", "Element", "VoidElement", "CDATA", "ProcessingInstruction", "Text", "Comment"][this.#type]
	}

	/**
	 * The raw character data value of this Node.
	 *
	 * @returns {string}
	 */
	get value() {
		return this.#value
	}

	/**
	 * The XML declaration of this Node.
	 *
	 * @returns {XmlDeclaration|undefined}
	 */
	get xmlDeclaration() {
		return this.#xmlDeclaration
	}

	/**
	 * The last child Node of this Node's parent Node.
	 *
	 * @returns {Node|undefined}
	 */
	get youngestSibling() {
		return this.#parent?.lastChild
	}

	/**
	 * Adds the given name/value pair as an attribute to this Node. If the attribute already exists, it will be
	 * overwritten.
	 *
	 * @param {string} name The attribute name
	 * @param {string} [value] The attribute's value as a string
	 * @returns {Node} The instance for chaining
	 */
	addAttribute(name, value) {
		if (!Node.isElement(this)) throw new Error(`Cannot use addAttribute on ${this.typeText} Node`)
		if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)

		name = name.trim()

		if (!name.length) throw new Error(`Expected name to have at least one character, instead got an empty string`)
		if (value !== undefined && typeof value !== "string")
			throw new TypeError(`Expected value to be a string, instead got ${typeof value}`)

		this.#attributes[name] = value

		return this
	}

	/**
	 * Adds the given class name(s) to this Node's class attribute.
	 *
	 * @param {string|string[]} className The class name(s) to add
	 * @returns {Node} The instance for chaining
	 */
	addClass(className) {
		if (!Node.isElement(this)) throw new Error(`Cannot use addClass on ${this.typeText} Node`)
		if (!Array.isArray(className)) className = [className]
		if (!this.#attributes?.class) this.#attributes.class = ""

		const split = this.#attributes.class.trim().split(/\s+/)

		for (let i = 0; i < className.length; i++) {
			const c = className[i]

			if (typeof c !== "string")
				throw new TypeError(`Expected className to be one of string|string[], instead found ${typeof c}`)

			split.push(c.trim())
		}

		this.#attributes.class = [...new Set(split)].join(" ")

		return this
	}

	/**
	 * Appends the given Nodes as children to this Node.
	 *
	 * @note Appended children will lose all parent and sibling references.
	 * @param {Node|Node[]} node The Node(s) to append
	 * @returns {Node} The instance for chaining
	 */
	appendChild(node) {
		if (!this.canContainChildren) throw new Error(`Cannot use appendChild on ${this.typeText} Node`)
		if (!Array.isArray(node)) node = [node]

		let p = this.#children[this.#children.length - 1]

		for (const c of node) {
			if (!Node.isNode(c)) throw new TypeError(`Expected node to be one of Node|Node[], instead found ${typeof c}`)
			if (c.parent) c.parent.removeChild(c)

			c[setParent](this)

			if (Node.isNode(p)) {
				p[setNext](c)
				c[setPrevious](p)
			}

			this.#children.push(c)
			p = c
		}

		return this
	}

	/**
	 * Appends the given Nodes as direct siblings to this Node.
	 *
	 * @note Appended siblings will lose all parent and sibling references.
	 * @param {Node|Node[]} node The Node(s) to append
	 * @returns {Node} The instance for chaining
	 */
	appendSibling(node) {
		if (Node.isDocument(this)) throw new Error(`Cannot use appendSibling on Document Node`)
		if (!this.#parent) throw new Error(`Cannot use appendSibling on Nodes without a parent Node`)
		if (!Array.isArray(node)) node = [node]

		const p = this.#parent
		const pc = p.children

		if (pc[pc.length - 1] === this) {
			this.#parent.appendChild(node)
			return this
		}

		pc.splice(pc.indexOf(this) + 1, 0, ...node)

		for (let i = 0; i < pc.length; i++) {
			const c = pc[i]

			if (!(c instanceof Node)) throw new TypeError(`Expected node to be one of Node|Node[], instead found ${typeof c}`)

			c[setParent](p)
			c[setPrevious](pc[i - 1])
			c[setNext](pc[i + 1])
		}

		return this
	}

	/**
	 * Removes this Node from its parent's list of child Nodes.
	 *
	 * @alias `emancipate`
	 * @note I just couldn't resist the tempation...
	 * @returns {Node} The instance for chaining
	 */
	batman() {
		this.#parent?.removeChild(this)

		return this
	}

	/**
	 * Removes this Node from its parent's list of child Nodes.
	 *
	 * @returns {Node} The instance for chaining
	 */
	emancipate() {
		this.#parent?.removeChild(this)

		return this
	}

	/**
	 * Checks if an attribute with the given name exists on this Node's attribute list.
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	hasAttribute(name) {
		return Object.hasOwn(this.#attributes, name)
	}

	/**
	 * Checks if this Node is a child of the given Node.
	 *
	 * @param {Node} node
	 * @returns {boolean}
	 */
	isChildOf(node) {
		return this.#parent === node
	}

	/**
	 * Checks if this Node is a parent to the given Node.
	 *
	 * @param {Node} node
	 * @returns {boolean}
	 */
	isParentOf(node) {
		return this.#children.includes(node)
	}

	/**
	 * Gets the nth child of this Node.
	 *
	 * @note Children are indexed by 1, not by 0.
	 * @note Negative numbers will work from the last child to the first.
	 * @param {number} n The 1-based index of the child Node to get
	 * @returns {Node|undefined}
	 */
	nthChild(n) {
		if (!!this.#children.length) return undefined

		const idx = n > 0 ? n - 1 : this.#children.length + n

		if (idx < 0 || idx >= this.#children.length) return undefined

		return this.#children[idx]
	}

	/**
	 * Prepends the given Nodes as children to this Node.
	 *
	 * @note Prepended children will lose all parent and sibling references.
	 * @param {Node|Node[]} node The Node(s) to prepend
	 * @returns {Node} The instance for chaining
	 */
	prependChild(node) {
		if (!this.canContainChildren) throw new Error(`Cannot use prependChild on ${this.typeText} Node`)
		if (!Array.isArray(node)) node = [node]

		let p = this.#children[this.#children.length - 1]

		for (const c of node) {
			if (!Node.isNode(c)) throw new TypeError(`Expected node to be one of Node|Node[], instead found ${typeof c}`)
			if (c.parent) c.parent.removeChild(c)

			c[setParent](this)

			if (Node.isNode(p)) {
				p[setNext](c)
				c[setPrevious](p)
			}

			this.#children.unshift(c)
			p = c
		}

		return this
	}

	/**
	 * Prepends the given Nodes as direct siblings to this Node.
	 *
	 * @note Prepended siblings will lose all parent and sibling references.
	 * @param {Node|Node[]} node The Node(s) to prepend
	 * @returns {Node} The instance for chaining
	 */
	prependSibling(...node) {
		if (Node.isDocument(this)) throw new Error(`Cannot use prependSibling on Document Node`)
		if (!this.#parent) throw new Error(`Cannot use prependSibling on Nodes without a parent Node`)
		if (!Array.isArray(node)) node = [node]

		const p = this.#parent
		const pc = p[getChildren]()

		if (pc[pc.length - 1] === this) {
			this.#parent.appendChild(...node)
			return this
		}

		pc.splice(pc.indexOf(this), 0, ...node)

		for (let i = 0; i < pc.length; i++) {
			const c = pc[i]

			if (!(c instanceof Node)) throw new TypeError(`Expected node to be one of Node|Node[], instead found ${typeof c}`)

			c[setParent](p)
			c[setPrevious](pc[i - 1])
			c[setNext](pc[i + 1])
		}

		return this
	}

	/**
	 * Removes the attribute corresponding to the given name from this Node's attribute list.
	 *
	 * @param {string} name The attribute name to remove
	 * @returns {Node} The instance for chaining
	 */
	removeAttribute(name) {
		if (!Node.isElement(this)) return this
		if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)

		delete this.#attributes[name]

		return this
	}

	/**
	 * Removes all attributes from this Node's attribute list.
	 *
	 * @returns {Node} The instance for chaining
	 */
	removeAttributes() {
		this.#attributes = {}

		return this
	}

	/**
	 * Removes the given Node(s) from this Node's children.
	 *
	 * @param {Node|Node[]} node The Node(s) to remove
	 * @returns {Node} The instance for chaining
	 */
	removeChild(node) {
		if (!!this.#children.length) return this
		if (!Array.isArray(node)) node = [node]

		const remaining = []

		for (const c of this.#children) {
			if (!node.includes(c)) {
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

	/**
	 * Removes all child Nodes from this Node.
	 *
	 * @returns {Node} The instance for chaining
	 */
	removeChildren() {
		return this.removeChild(this.#children)
	}

	/**
	 * Removes the given class name(s) from this Node's class attribute.
	 *
	 * @param {string|string[]} className The class name(s) to remove
	 * @returns {Node} The instance for chaining
	 */
	removeClass(className) {
		if (!Array.isArray(className)) className = [className]
		if (!this.#attributes?.class) return this

		const classHash = toHashTable(this.#attributes.class.split(/\s+/))

		for (const classToRemove of className) {
			if (typeof classToRemove !== "string")
				throw new TypeError(`Expected className to be one of string|string[], instead found ${typeof classToRemove}`)

			delete classHash[classToRemove.trim()]
		}

		this.#attributes.class = Object.keys(classHash).join(" ")

		return this
	}

	/**
	 * Removes this Node's DOCTYPE declaration.
	 *
	 * @returns {Node} The instance for chaining
	 */
	removeDoctypeDeclaration() {
		this.#doctypeDeclaration = undefined

		return this
	}

	/**
	 * Removes this Node's name.
	 *
	 * @returns {Node} The instance for chaining
	 */
	removeName() {
		if (this.#type === ProcessingInstruction) throw new Error(`Cannot use removeName on a ProcessingInstruction Node`)

		this.#name = ""

		return this
	}

	/**
	 * Removes this Node's value.
	 *
	 * @returns {Node} The instance for chaining
	 */
	removeValue() {
		this.#value = ""

		return this
	}

	/**
	 * Removes this Node's XML declaration.
	 *
	 * @returns {Node} The instance for chaining
	 */
	removeXmlDeclaration() {
		this.#xmlDeclaration = undefined

		return this
	}

	/**
	 * Sets this Node's attributes list to the given attributes.
	 *
	 * @note This method will overwrite all attributes currently assigned to this Node.
	 * @param {{[name: string]: string}} attributes The name/value pairs to assign as attributes
	 * @returns {Node} The instance for chaining
	 */
	setAttributes(attributes) {
		if (!Node.isElement(this)) throw new Error(`Cannot use setAttributes on ${this.#type} Node`)
		if (Object.prototype.toString.call(attributes) !== "[object Object]")
			throw new TypeError(`Expected attributes to be an object, instead got ${typeof attributes}`)

		this.#attributes = {}

		for (let [name, value] of Object.entries(attributes)) {
			if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)
			if (typeof value !== "string") throw new TypeError(`Expected value to be a string, instead got ${typeof value}`)

			name = name.trim()

			if (!name.length) throw new Error(`Expected name to have at least one character, instead got an empty string`)

			this.#attributes[name] = value
		}

		return this
	}

	/**
	 * Sets this Node's children to the given Nodes.
	 *
	 * @note This method will overwrite all children currently assigned to this Node.
	 * @param {Node[]} children
	 * @returns {Node} The instance for chaining
	 */
	setChildren(children) {
		if (!this.canContainChildren) throw new Error(`Cannot use setChildren on ${this.#type} Node`)
		if (!Array.isArray(children))
			throw new TypeError(`Expected children to be a Node[], instead got ${typeof children}`)

		this.removeChild(this.#children)
		this.appendChild(children)

		return this
	}

	/**
	 * Sets this Node's DOCTYPE declaration.
	 *
	 * @note Only available to Document Nodes.
	 * @param {DoctypeDeclaration} doctypeDeclaration
	 * @returns {Node} The instance for chaining
	 */
	setDoctypeDeclaration(doctypeDeclaration) {
		if (this.#type !== Document) throw new Error(`Cannot use setDoctypeDeclaration on ${this.typeText} Node`)
		if (!DoctypeDeclaration.isDoctypeDeclaration(doctypeDeclaration))
			throw new TypeError(
				`Expected doctypeDeclaration to be a DoctypeDeclaration, instead got ${typeof doctypeDeclaration}`
			)

		this.#doctypeDeclaration = doctypeDeclaration

		return this
	}

	/**
	 * Sets this Node's name.
	 *
	 * @param {string} name
	 * @returns {Node} The instance for chaining
	 */
	setName(name) {
		if (![Element, VoidElement, ProcessingInstruction].includes(this.#type))
			throw new Error(`Cannot use setName on ${this.#type} Node`)
		if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)

		name = name.trim()

		if (!name.length) throw new Error(`Expected name to have at least one character, instead got an empty string`)

		this.#name = name

		return this
	}

	/**
	 * Sets this Node's type.
	 *
	 * @note This method will adjust this Node so that its properties are congruent to the type it holds. For
	 * example, if it were previously an Element and was changed to a VoidElement, all of its children will be
	 * removed.
	 * @param {Virty.Document|Virty.Element|Virty.VoidElement|Virty.CDATA|Virty.ProcessingInstruction|Virty.Text|Virty.Comment} type
	 * @returns {Node} The instance for chaining
	 */
	setType(type) {
		this.#type = type

		switch (type) {
			case Document:
				this.batman() // I mean... I made the function. dya think I wasn't gonna use it internally?
				this.#attributes = {}
				this.#name = ""
				this.#value = ""

				break
			case Element:
				this.#doctypeDeclaration = undefined
				this.#value = ""
				this.#xmlDeclaration = undefined

				break
			case VoidElement:
				this.removeChildren()
				this.#doctypeDeclaration = undefined
				this.#value = ""
				this.#xmlDeclaration = undefined

				break
			case ProcessingInstruction:
				this.removeChildren()
				this.#attributes = {}
				this.#doctypeDeclaration = undefined
				this.xmlDeclaration = undefined

				break
			case CDATA:
			case Text:
			case Comment:
				this.removeChildren()
				this.#attributes = {}
				this.#doctypeDeclaration = undefined
				this.#name = ""
				this.xmlDeclaration = undefined

				break
			default:
				throw new TypeError(`Expected type to be one of 0|1|2|3|4|5|6, instead got ${type}`)
		}

		return this
	}

	/**
	 * Sets this Node's value.
	 *
	 * @param {string} value
	 * @returns {Node} The instance of chaining
	 */
	setValue(value) {
		if (!Node.isCharacterData(this)) throw new Error(`Cannot use setValue on ${this.#type} Node`)
		if (typeof value !== "string") throw new TypeError(`Expected value to be a string, instead got ${typeof value}`)

		this.#value = value

		return this
	}

	/**
	 * Sets this Node's XML Declaration.
	 *
	 * @param {XmlDeclaration} xmlDeclaration
	 * @returns {Node} The instance for chaining
	 */
	setXmlDeclaration(xmlDeclaration) {
		if (this.#type !== Document) throw new Error(`Cannot use setXmlDeclaration on ${this.typeText} Node`)
		if (!XmlDeclaration.isXmlDeclaration(xmlDeclaration))
			throw new TypeError(`Expected xmlDeclaration to be an XmlDeclaration, instead got ${typeof xmlDeclaration}`)

		this.#xmlDeclaration = xmlDeclaration

		return this
	}

	/**
	 * Toggles the given class name(s) on this Node's class attribute.
	 *
	 * @param {string|string[]} className The class name(s) to toggle
	 * @returns {Node} The instance for chaining
	 */
	toggleClass(className) {
		if (!Node.isElement(this)) throw new Error(`Cannot use toggleClass on ${this.typeText} Node`)
		if (!Array.isArray(className)) className = [className]
		if (!this.#attributes?.class) this.#attributes.class = ""

		const classHash = toHashTable(this.#attributes.class.split(/\s+/))

		for (let classToToggle of className) {
			if (typeof classToToggle !== "string")
				throw new TypeError(`Expected className to be one of string|string[], instead found ${typeof classToToggle}`)

			classToToggle = classToToggle.trim()

			if (classHash[classToToggle]) {
				delete classHash[classToToggle]
			} else {
				classHash[classToToggle] = true
			}
		}

		this.#attributes.class = Object.keys(classHash).join(" ")

		return this
	}

	/**
	 * Converts this Node and all of its descendents into a String.
	 *
	 * @param {object} [options]
	 * @param {string} [options.indentChar] The character to use for indentation (default: `""`)
	 * @param {number} [options.indentSize] The number of times to use the indentation character (default: `0`)
	 * @param {boolean} [options.useNewLine] Whether to use a `\n` to separate each node (default: `true` when `indentChar` and `indentSize` are truthy, otherwise `false`)
	 * @param {number} [options.printWidth] The maximum visual column size to print before wrapping to the next line (default: `100`) ⚠️ Planned, but not implemented
	 * @returns {string}
	 */
	toString(options) {
		if (Object.prototype.toString.call(options) !== "[object Object]") options = {}
		if (typeof options.indentChar !== "string") options.indentChar = ""
		if (typeof options.indentSize !== "number" || !Number.isInteger(options.indentSize)) options.indentSize = 0
		if (typeof options.useNewLine !== "boolean")
			options.useNewLine = options.indentChar && options.indentSize ? true : false

		let result = []
		const q = [{ node: this, depth: 0 }]

		while (q.length) {
			const { node, depth, shouldClose } = q.shift()
			const indent = options.indentChar.repeat(depth * options.indentSize)

			if (node.type === Element) {
				if (shouldClose) {
					result.push(`${indent}</${node.name}>`)
					continue
				}

				const attr = Object.entries(node.attributes).reduce((p, [n, v]) => `${p} ${n}="${v}"`, "")

				result.push(`${indent}<${node.name}${attr}>`)

				if (node.children.length) {
					const children = node.children.map(c => ({ node: c, depth: depth + 1 }))

					q.unshift(...children, { node, depth, shouldClose: true })
				}
			} else if (node.type === Text) {
				if (node.value.length) result.push(`${indent}${node.value}`)
			} else if (node.type === Comment) {
				result.push(`${indent}<!-- ${node.value} -->`)
			} else if (node.type === CDATA) {
				result.push(`${indent}<![CDATA[${node.value}]]`)
			} else if (node.type === ProcessingInstruction) {
				result.push(`<?${node.name} ${node.value}?>`)
			} else if (node.type === Document) {
				const xmlDeclarationStr = node.xmlDeclaration?.toString()
				const doctypeDeclarationStr = node.doctypeDeclaration?.toString()

				if (xmlDeclarationStr) result.push(xmlDeclarationStr)
				if (doctypeDeclarationStr) result.push(doctypeDeclarationStr)
				if (node.children.length) {
					const children = node.children.map(c => ({ node: c, depth }))

					q.unshift(...children)
				}
			}
		}

		return result.join(options.useNewLine ? "\n" : "")
	}

	// Work in progress
	query(queryString) {
		if (typeof queryString !== "string") throw new TypeError("Expected 'queryString' to be a string")
		if (!queryString.length) return undefined

		// [attrName] (matches nodes that have the given attribute name)
		// [attrName: attrValue] (matches nodes that have the given attribute name with the given attribute value)
		// [attrName1|attrName2] (matches nodes that have one of the given attribute names)
		// [attrName1&attrName2] (matches nodes that have both of the given attribute names)
		// [attrName: attrValue1|attrValue2] (matches nodes that have the given attribute name with one of the given attribute values)
		// [attrName: attrValue1&attrValue2] (matches nodes that have the given attribute name with both of the given attribute values)
		// [:attrValue] (matches nodes that have any attribute with the given attribute value)
		// [an{op?}?:?av{op?}?] (matches attribute name with optional operators "&" and "|" that have a matching attribute value with optional operators "&" and "|")
		// ex. [class:"a"|"b"] - matches a node with the attribute "class" that fully matches its value as either "a" or "b"
		// ex. [data-value|value:"username"] - matches a node with either an attribute "data-value" or "value" that has the value "username"
		// ex. [:true] - matches any node with a boolean attribute
		// ex. [data-toggle] - matches any node with a data-toggle attribute regardless of its value
		// ex. [a|b&c] - matches any node with either an attribute called "a", or a node with both a "b" and a "c" attribute, regardless of value

		// Characters
		// const DQ = '"'
		// const SQ = "'"
		// const OB = "["
		// const CB = "]"

		// Gates
		const TAG_NAME = "tag name"
		const ATT_NAME = "attribute name"
		const ATT_VALU = "attribute value"

		const selectors = []
		let qbuf = {}
		let buf = ""
		let gate
		let suspect
		let context

		for (const char of queryString) {
			// need to define the full workings of my query language first, and only then can I actually make a parser
			// either that, or just do css selectors...

			buf = `${char}${buf}`
		}
	}
}

// TODO: query
// TODO: document api/changes in readme
