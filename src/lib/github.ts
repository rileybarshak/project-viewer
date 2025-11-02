interface ProjectFile {
	name: string
	path: string
	type: string
	download_url: string | null
}

interface ProjectWithTags {
	name: string
	path: string
	type: string
	tags: string[]
}

export async function getProjects(): Promise<ProjectWithTags[]> {
	try {
		const response = await fetch("https://api.github.com/repos/rileybarshak/projects/contents", {
			headers: {
				Accept: "application/vnd.github.v3+json",
			},
			next: { revalidate: 3600 },
		})

		if (!response.ok) {
			throw new Error("Failed to fetch projects")
		}

		const data = await response.json()
		const directories = data.filter((item: any) => item.type === "dir")

		//Fetch tags for each project
		const projectsWithTags = await Promise.all(
			directories.map(async (dir: any) => {
				const tags = await extractTagsFromProject(dir.name)
				return {
					name: dir.name,
					path: dir.path,
					type: dir.type,
					tags,
				}
			}),
		)

		return projectsWithTags
	} catch (error) {
		console.error("Error fetching projects:", error)
		return []
	}
}

export async function extractDescriptionFromProject(projectName: string): Promise<string> {
	try {
		//Fetch project files
		const response = await fetch(`https://api.github.com/repos/rileybarshak/projects/contents/${projectName}`, {
			headers: {
				Accept: "application/vnd.github.v3+json",
			},
			next: { revalidate: 3600 },
		})

		if (!response.ok) {
			return ""
		}

		const files: ProjectFile[] = await response.json()
		const markdownFile = files.find((file) => file.name.toLowerCase().endsWith(".md") && file.download_url)

		if (!markdownFile || !markdownFile.download_url) {
			return ""
		}

		//Fetch markdown content
		const contentResponse = await fetch(markdownFile.download_url, {
			next: { revalidate: 3600 },
		})

		if (!contentResponse.ok) {
			return ""
		}

		const content = await contentResponse.text()
		const lines = content.split("\n")

		//check line 3 (index 2) for description
		if (lines.length >= 3) {
			const line3 = lines[2]
			//Match pattern: **Project Description:** Description
			const match = line3.match(/\*\*Project?\s*Description?:\*\*\s*(.+)/i)
			if (match) {
				const desc = match[1]
				return desc
			}

		}

		return ""
	} catch (error) {
		console.error(`Error extracting tags for ${projectName}:`, error)
		return ""
	}
}


export async function extractTagsFromProject(projectName: string): Promise<string[]> {
	try {
		//Fetch project files
		const response = await fetch(`https://api.github.com/repos/rileybarshak/projects/contents/${projectName}`, {
			headers: {
				Accept: "application/vnd.github.v3+json",
			},
			next: { revalidate: 3600 },
		})

		if (!response.ok) {
			return []
		}

		const files: ProjectFile[] = await response.json()
		const markdownFile = files.find((file) => file.name.toLowerCase().endsWith(".md") && file.download_url)

		if (!markdownFile || !markdownFile.download_url) {
			return []
		}

		//Fetch markdown content
		const contentResponse = await fetch(markdownFile.download_url, {
			next: { revalidate: 3600 },
		})

		if (!contentResponse.ok) {
			return []
		}

		const content = await contentResponse.text()
		const lines = content.split("\n")

		//Check line 5 (index 4) for tags
		if (lines.length >= 5) {
			const line4 = lines[4]
			//Match pattern: **Languages & Technologies:** Next.js, React, TypeScript, Tailwind CSS
			const match = line4.match(/\*\*Languages?\s*&\s*Technologies?:\*\*\s*(.+)/i)
			if (match) {
				const tagsString = match[1]
				//Split by comma and clean up
				return tagsString
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0)
			}
		}

		return []
	} catch (error) {
		console.error(`Error extracting tags for ${projectName}:`, error)
		return []
	}
}

export async function getProjectFiles(projectName: string): Promise<ProjectFile[]> {
	try {
		const response = await fetch(`https://api.github.com/repos/rileybarshak/projects/contents/${projectName}`, {
			headers: {
				Accept: "application/vnd.github.v3+json",
			},
			next: { revalidate: 3600 },
		})

		if (!response.ok) {
			return []
		}

		return await response.json()
	} catch (error) {
		console.error("Error fetching project files:", error)
		return []
	}
}

export async function getFileContent(url: string): Promise<string> {
	try {
		const response = await fetch(url, {
			next: { revalidate: 3600 },
		})

		if (!response.ok) {
			return ""
		}

		return await response.text()
	} catch (error) {
		console.error("Error fetching file content:", error)
		return ""
	}
}
