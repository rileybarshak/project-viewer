import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"

interface ProjectFile {
  name: string
  path: string
  type: string
  download_url: string | null
  content?: string
}

async function getProjectFiles(projectName: string): Promise<ProjectFile[]> {
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
    console.error("[v0] Error fetching project files:", error)
    return []
  }
}

async function getFileContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return ""
    }

    return await response.text()
  } catch (error) {
    console.error("[v0] Error fetching file content:", error)
    return ""
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const projectName = decodeURIComponent(name)
  const files = await getProjectFiles(projectName)

  if (files.length === 0) {
    notFound()
  }

  // Find markdown files
  const markdownFiles = files.filter((file) => file.name.toLowerCase().endsWith(".md") && file.download_url)

  // Find image files
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file.name) && file.download_url)

  // Get content for markdown files
  const markdownContents = await Promise.all(
    markdownFiles.map(async (file) => ({
      name: file.name,
      content: file.download_url ? await getFileContent(file.download_url) : "",
    })),
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        {/* Project Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">{projectName}</h1>
          <p className="text-muted-foreground">
            {files.length} {files.length === 1 ? "file" : "files"} in this project
          </p>
        </div>

        {/* Markdown Content */}
        {markdownContents.length > 0 && (
          <div className="space-y-8 mb-12">
            {markdownContents.map((md, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">{md.name}</h2>
                  </div>
                  <div className="prose prose-neutral dark:prose-invert">
                    <ReactMarkdown>{md.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Images */}
        {imageFiles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Images</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {imageFiles.map((image, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <img src={image.download_url || ""} alt={image.name} className="w-full h-auto" />
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">{image.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Content Message */}
        {markdownContents.length === 0 && imageFiles.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No markdown files or images found in this project.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
