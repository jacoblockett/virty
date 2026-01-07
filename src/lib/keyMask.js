// Key masks are symbols used as keys for internal-only methods/properties.
// This allows cross-module access within Virty (e.g., setParent()) while
// preventing external users from accidentally calling internal APIs.

export const setNext = Symbol("setNext")
export const setParent = Symbol("setParent")
export const setPrevious = Symbol("setPrevious")
