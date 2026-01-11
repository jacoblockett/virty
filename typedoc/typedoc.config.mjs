import { OptionDefaults } from "typedoc"

const config = {
	entryPoints: ["../src/index.js"],
	entryPointStrategy: "expand",
	out: "../docs",
	tsconfig: "./tsconfig.json",
	exclude: ["**/keyMask.js"],
	sort: ["kind", "alphabetical"],
	hideGenerator: true,
	gitRemote: "github",
	plugin: ["typedoc-material-theme", "@shipgirl/typedoc-plugin-versions"],
	themeColor: "#12e691",
	blockTags: [...OptionDefaults.blockTags, "@note", "@alias"],
	intentionallyNotExported: ["Attribute"],
	categorizeByGroup: false,
	defaultCategory: "Core",
	navigation: {
		includeCategories: true,
		includeGroups: false
	},
	name: "Virty",
	customCss: "./override.css",
	customJs: "./override.js",
	categoryOrder: ["Constants", "*", "Declarations"]
}

export default config
