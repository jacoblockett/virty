export default class EntityDeclaration {
	#isParameterEntityDeclaration = false
	#name
	#publicID
	#systemURI
	#value
	#ndata

	/**
	 * @note To be used within `DoctypeDeclaration`
	 * @param {object} [init]
	 * @param {boolean} [init.isParameterEntityDeclaration] Whether the EntityDeclaration is used as an internal parameter or not
	 * @param {string} [init.name] The name used to refer to the EntityDeclaration
	 * @param {string} [init.publicID] The ID used with the PUBLIC keyword
	 * @param {string} [init.systemURI] The URI used with the SYSTEM keyword, or in tandem with the PUBLIC keyword's ID
	 * @param {string} [init.value] The value of the EntityDeclaration. When `publicID` or `systemURI` are specified, `value` is ignored
	 * @param {string} [init.ndata] The NDATA name corresponding to a Notation declaration's name
	 */
	constructor(init) {
		if (Object.prototype.toString.call(init) !== "[object Object]") init = {}
		if (init.isParameterEntityDeclaration) this.setIsParameterEntityDeclaration(init.isParameterEntityDeclaration)
		if (init.name) this.setName(init.name)
		if (init.publicID) this.setPublicID(init.publicID)
		if (init.systemURI) this.setSystemURI(init.systemURI)
		if (init.value) this.setValue(init.value)
		if (init.ndata) this.setNDATA(init.ndata)
	}

	/**
	 * Checks if the given value is an EntityDeclaration.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isEntityDeclaration(value) {
		return value instanceof EntityDeclaration
	}

	/**
	 * Whether or not the EntityDeclaration is a Parameter EntityDeclaration.
	 *
	 * @returns {boolean}
	 */
	get isParameterEntityDeclaration() {
		return this.#isParameterEntityDeclaration
	}

	/**
	 * The name of the EntityDeclaration.
	 *
	 * @returns {string|undefined}
	 */
	get name() {
		return this.#name
	}

	/**
	 * The PUBLIC Identifier of the EntityDeclaration.
	 *
	 * @returns {string|undefined}
	 */
	get publicID() {
		return this.#publicID
	}

	/**
	 * The SYSTEM URI of the EntityDeclaration.
	 *
	 * @returns {string|undefined}
	 */
	get systemURI() {
		return this.#systemURI
	}

	/**
	 * The value of the EntityDeclaration.
	 *
	 * @returns {string|undefined}
	 */
	get value() {
		return this.#value
	}

	/**
	 * The NDATA name corresponding to a Notation declaration used with the EntityDeclaration.
	 *
	 * @returns {string|undefined}
	 */
	get ndata() {
		return this.#ndata
	}

	/**
	 * Checks if the EntityDeclaration is Internal.
	 *
	 * @returns {boolean}
	 */
	get isInternal() {
		return !this.#publicID && !this.#systemURI
	}

	/**
	 * Checks if the EntityDeclaration is External.
	 *
	 * @returns {boolean}
	 */
	get isExternal() {
		return this.#publicID || this.#systemURI
	}

	/**
	 * Sets whether the entity is a Parameter EntityDeclaration or not.
	 *
	 * @param {boolean} bool
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	setIsParameterEntityDeclaration(bool) {
		if (typeof bool !== "boolean") throw new TypeError(`Expected bool to be a boolean, instead got ${typeof bool}`)

		this.#isParameterEntityDeclaration = bool

		return this
	}

	/**
	 * Sets the name of the EntityDeclaration.
	 *
	 * @param {string} name
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	setName(name) {
		if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)

		name = name.trim()

		if (!name.length) throw new Error(`Expected name to have at least one character, instead got an empty string`)

		this.#name = name

		return this
	}

	/**
	 * Sets the PUBLIC Identifier of the EntityDeclaration. You can optionally set the System URI that goes along with the
	 * PUBLIC Identifer as well.
	 *
	 * @param {string} publicID
	 * @param {string} [systemURI]
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	setPublicID(publicID, systemURI) {
		if (typeof publicID !== "string")
			throw new TypeError(`Expected publicID to be a string, instead got ${typeof publicID}`)

		this.#publicID = publicID

		if (systemURI !== undefined) {
			if (typeof systemURI !== "string")
				throw new TypeError(`Expected systemURI to be a string, instead got ${typeof systemURI}`)

			this.#systemURI = systemURI
		}

		return this
	}

	/**
	 * Sets the SYSTEM URI of the EntityDeclaration.
	 *
	 * @param {string} systemURI
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	setSystemURI(systemURI) {
		if (typeof systemURI !== "string")
			throw new TypeError(`Expected systemURI to be a string, instead got ${typeof systemURI}`)

		this.#systemURI = systemURI

		return this
	}

	/**
	 * Sets the NDATA of the EntityDeclaration.
	 *
	 * @param {string} ndata
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	setNDATA(ndata) {
		if (typeof ndata !== "string") throw new TypeError(`Expected ndata to be a string, instead got ${typeof ndata}`)

		ndata = ndata.trim()

		if (!ndata.length) throw new Error(`Expected ndata to have at least one character, instead got an empty string`)

		this.#ndata = ndata

		return this
	}

	/**
	 * Sets the value of the EntityDeclaration.
	 *
	 * @param {string} value
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	setValue(value) {
		if (typeof value !== "string") throw new TypeError(`Expected value to be a string, instead got ${typeof value}`)

		this.#value = value

		return this
	}

	/**
	 * Removes the name of the EntityDeclaration.
	 *
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	removeName() {
		this.#name = undefined

		return this
	}

	/**
	 * Removes the PUBLIC Identifier of the EntityDeclaration.
	 *
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	removePublicID() {
		this.#publicID = undefined

		return this
	}

	/**
	 * Removes the SYSTEM URI of the EntityDeclaration.
	 *
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	removeSystemURI() {
		this.#systemURI = undefined

		return this
	}

	/**
	 * Removes the value of the EntityDeclaration.
	 *
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	removeValue() {
		this.#value = undefined

		return this
	}

	/**
	 * Removes the NDATA of the EntityDeclaration.
	 *
	 * @returns {EntityDeclaration} The instance for chaining
	 */
	removeNDATA() {
		this.#ndata = undefined

		return this
	}

	/**
	 * Converts the EntityDeclaration declaration into a String.
	 *
	 * @returns {string}
	 */
	toString() {
		const paramToken = this.#isParameterEntityDeclaration ? " %" : ""
		const name = this.#name ? ` ${this.#name}` : ""
		const pubsys = this.#publicID ? ` PUBLIC "${this.#publicID}" "${this.#systemURI || ""}"` : ""
		const sys = !this.#publicID && this.#systemURI ? ` SYSTEM "${this.#systemURI}"` : ""
		const value = !this.#publicID && !this.systemURI ? ` "${this.#value}"` : ""
		const ndata = this.#ndata ? ` NDATA ${this.#ndata}` : ""

		return `<!ENTITY${paramToken}${name}${pubsys}${sys}${value}${ndata}>`
	}
}
