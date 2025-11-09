/*
CONFIG

Edit values or add new ones to change the following:
	- Github User
	- Tag categories
		- Category colors
		- Category values
*/

//export const GITHUB_USER = "<github-username>"; 
export const GITHUB_USER = "rileybarshak"; 

export const tagCategories: Record<string, [string, Array<string>]> = {
	//<Category>: [bg-color text-color, [word1, word2, word3, ...]],
	languages: ["bg-green-200 text-green-700", ["python", "typescript", "javascript", "java", "go"]],
	frameworksAndLibraries: ["bg-blue-200 text-blue-700", ["react", "next.js", "tailwind css"]],
	devOps: ["bg-amber-200 text-amber-700", ["docker", "git", "kubernetes"]],
	databases: ["bg-purple-200 text-purple-700", ["mongodb", "sql", "postgresql"]],
	hardware: ["bg-rose-200 text-rose-700", ["3d modeling", "3d printing", "cad", "arduino", "electrical systems", "embedded systems"]]
}
