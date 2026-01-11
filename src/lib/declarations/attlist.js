/**
 * TODO:
 * ✔️attlistDeclaration
 * update doctype to use new declarations
 * update document to use doctype
 * xmlInstruction (maybe change structure to instructions/xml)
 * update document to use xmlInstruction
 * add other instructions if they exist
 * possibly update the Node model - raw text nodes don't really have business
 *   having all of those features if they don't need them...
 * parse doctype and xml instruction, and other instructions if they exist
 * - you'll need to update the parser to use the new virty api of course
 * and don't forget to update the readme if you have time (virty)
 */

import { toHashTable } from "alltheutils"

const TYPE_KEYWORDS = ["cdata", "id", "idref", "idrefs", "nmtoken", "nmtokens", "entity", "entities"]
const TYPE_KEYWORDS_HASH = toHashTable(TYPE_KEYWORDS)
const DEFAULT_KEYWORDS = ["required", "optional", "fixed", "default"]
const DEFAULT_KEYWORDS_HASH = toHashTable(["required", "optional", "fixed", "default"])

/**
 * @typedef {object} Attribute
 * @property {string} name
 * @property {"cdata"|"id"|"idref"|"idrefs"|"nmtoken"|"nmtokens"|"entity"|"entities"|string[]} type Type keyword or array of allowed values
 * @property {boolean} [isNotationType] If true, prepends "NOTATION" to enumerated values (default: `false`)
 * @property {"required"|"optional"|"fixed"|"default"} [defaultType] (default: `"optional"`, unless `defaultValue` is given, in which case default: `"default"`)
 * @property {string} [defaultValue] Required for "fixed" and "default" types
 */

/**
 * @category Declarations
 */
export default class AttListDeclaration {
	#element
	#attributes = {}

	/**
	 * @note To be used within `DoctypeDeclaration`
	 * @param {object} [init]
	 * @param {string} [init.element] The name of the element this AttListDeclaration is being declared upon
	 * @param {Attribute[]} [init.attributes] The attributes to declare
	 */
	constructor(init) {
		if (Object.prototype.toString.call(init) !== "[object Object]") init = {}
		if (init.element) this.setElement(init.element)
		if (init.attributes) this.setAttributes(init.attributes)
	}

	/**
	 * Checks if the given value is an AttListDeclaration.
	 *
	 * @param {unknown} value
	 * @return {boolean}
	 */
	static isAttListDeclaration(value) {
		return value instanceof AttListDeclaration
	}

	/**
	 * The name of the element this AttListDeclaration is being declared upon.
	 *
	 * @return {string|undefined}
	 */
	get element() {
		return this.#element
	}

	/**
	 * The attributes declared for this AttListDeclaration.
	 *
	 * @return {Attribute[]}
	 */
	get attributes() {
		return [...Object.values(this.#attributes)]
	}

	/**
	 * Gets the specified attribute declared for this AttListDeclaration.
	 *
	 * @param {string} name
	 * @return {Attribute}
	 */
	getAttribute(name) {
		if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)

		return this.#attributes[name]
	}

	/**
	 * Sets the name of the element this AttListDeclaration is being declared upon.
	 *
	 * @param {string} name
	 * @return {AttListDeclaration} The instance for chaining
	 */
	setElement(name) {
		if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)

		name = name.trim()

		if (!name.length) throw new Error(`Expected name to have at least one character, instead got an empty string`)

		this.#element = name

		return this
	}

	/**
	 * Sets the attributes declared for this AttListDeclaration.
	 *
	 * @note This method overwrites the any attributes already declared. Use `addAttribute` or `addAttributes`
	 * to append to the list instead.
	 * @param {Attribute[]} attributes
	 * @return {AttListDeclaration} The instance for chaining
	 */
	setAttributes(attributes) {
		if (!Array.isArray(attributes))
			throw new TypeError(`Expected attributes to be an array, instead got ${typeof attributes}`)

		this.#attributes = {}

		for (const attribute of attributes) {
			this.addAttribute(attribute)
		}

		return this
	}

	/**
	 * Adds a new attribute to the attributes declared for this AttListDeclaration.
	 *
	 * @note An attribute that shares a name with an already defined attribute will overwrite the original attribute.
	 * @param {Attribute} attribute
	 * @return {AttListDeclaration} The instance for chaining
	 */
	addAttribute(attribute) {
		if (Object.prototype.toString.call(attribute) !== "[object Object]")
			throw new TypeError(`Expected attribute to be an Attribute, instead got ${typeof attribute}`)
		if (typeof attribute.name !== "string")
			throw new TypeError(`Expected attribute.name to be a string, instead got ${typeof attribute.name}`)

		attribute.name = attribute.name.trim()

		if (!attribute.name.length)
			throw new Error(`Expected attribute.name to have at least one character, instead got an empty string`)

		const types = new Set()

		if (typeof attribute.type === "string") {
			attribute.type = attribute.type.trim().toLowerCase()

			if (!TYPE_KEYWORDS_HASH[attribute.type])
				throw new TypeError(
					`Expected attribute.type to be one of ${TYPE_KEYWORDS.join("|")}, instead got ${attribute.type}`
				)

			types.add(attribute.type)
		} else if (Array.isArray(attribute.type)) {
			if (!attribute.type.length)
				throw new Error(`Expected attribute.type to have at least one type declared, instead got an empty array`)

			for (const type of attribute.type) {
				if (typeof type !== "string")
					throw new TypeError(`Expected attribute.type to be an array of strings, instead found ${typeof type}`)

				types.add(type)
			}
		} else {
			throw new TypeError(
				`Expected attribute.type to be one of ${TYPE_KEYWORDS.join(
					"|"
				)}|string[], instead got ${typeof attribute.type} (${attribute.type})`
			)
		}

		if (attribute.isNotationType === undefined) {
			attribute.isNotationType = false
		} else if (typeof attribute.isNotationType !== "boolean") {
			throw new TypeError(
				`Expected attribute.isNotationType to be a boolean, instead got ${typeof attribute.isNotationType}`
			)
		}

		if (attribute.defaultType !== undefined) {
			if (typeof attribute.defaultType !== "string")
				throw new TypeError(
					`Expected attribute.defaultType to be a string, instead got ${typeof attribute.defaultType}`
				)

			attribute.defaultType = attribute.defaultType.trim().toLowerCase()

			if (!DEFAULT_KEYWORDS_HASH[attribute.defaultType])
				throw new TypeError(
					`Expected attribute.defaultType to be one of ${DEFAULT_KEYWORDS.join("|")}, instead got ${
						attribute.defaultType
					}`
				)
		}

		if (attribute.defaultValue === undefined) {
			if (attribute.defaultType === "fixed" || attribute.defaultType === "default")
				throw new Error(
					`Expected attribute.defaultValue to have data since attribute.defaultType is "${attribute.defaultType}", instead got undefined`
				)
		} else if (typeof attribute.defaultValue === "string") {
			if (attribute.defaultType === undefined) attribute.defaultType = "default"
		} else {
			throw new TypeError(
				`Expected attribute.defaultValue to be a string, instead got ${typeof attribute.defaultValue}`
			)
		}

		if (attribute.defaultType === undefined) attribute.defaultType = "optional"

		this.#attributes[attribute.name] = {
			name: attribute.name,
			type: [...types],
			isNotationType: attribute.isNotationType,
			defaultType: attribute.defaultType,
			defaultValue: attribute.defaultValue
		}

		return this
	}

	/**
	 * Adds new attributes to the attributes declared for this AttListDeclaration.
	 *
	 * @note An attribute that shares a name with an already defined attribute will overwrite the original attribute.
	 * @param {Attribute[]} attributes
	 * @return {AttListDeclaration} The instance for chaining
	 */
	addAttributes(attributes) {
		if (!Array.isArray(attributes))
			throw new TypeError(`Expected attributes to be an Attribute[], instead got ${typeof attributes}`)

		for (const attribute of attributes) {
			this.addAttribute(attribute)
		}

		return this
	}

	/**
	 * Removes the name of the element this AttListDeclaration is being declared upon.
	 *
	 * @return {AttListDeclaration} The instance for chaining
	 */
	removeElement() {
		this.#element = undefined

		return this
	}

	/**
	 * Removes the specified attributes declared for this AttListDeclaration. If no attributes
	 * are specified, removes **all** the attributes.
	 *
	 * @param {string[]} names
	 * @return {AttListDeclaration} The instance for chaining
	 */
	removeAttributes(names) {
		if (names !== undefined) {
			if (!Array.isArray(names)) throw new TypeError(`Expected names to be a string[], instead got ${typeof names}`)

			for (const name of names) {
				if (typeof name !== "string")
					throw new TypeError(`Expected names to be a string[], instead found ${typeof name}`)

				delete this.#attributes[name]
			}
		} else {
			this.#attributes = {}
		}

		return this
	}

	/**
	 * Converts the AttListDeclaration into a String.
	 *
	 * @return {string}
	 */
	toString() {
		const element = this.#element ? ` ${this.#element}` : ""
		const attArr = Object.values(this.#attributes)
		const attributes = attArr.length
			? ` ${attArr.map(a => {
					const name = a.name ? ` ${a.name}` : ""
					const type = a.type
						? ` ${a.isNotationType ? "NOTATION" : ""}${a.type.length === 1 ? a.type : ` (${a.type.join("|")})`}`
						: ""
					const defaultType = a.defaultType
						? ` #${a.defaultType === "optional" ? "IMPLIED" : a.defaultType.toUpperCase()}`
						: ""
					const defaultValue = a.defaultValue
						? ` ${DEFAULT_KEYWORDS[a.defaultValue] ? `#${a.defaultValue.toUpperCase()}` : `"${a.defaultValue}"`}`
						: ""

					return `${name}${type}${defaultType}${defaultValue}`
			  })}`
			: ""

		return `<!ATTLIST${element}${attributes.join("")}>`
	}
}
