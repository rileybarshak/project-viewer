import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import { getProjectFiles, getFileContent, extractTagsFromProject } from "@/lib/github"

interface ProjectFile {
  name: string
  path: string
  type: string
  download_url: string | null
  content?: string
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const projectName = decodeURIComponent(name)
  const files = await getProjectFiles(projectName)

  if (!files || files.length === 0) {
    notFound()
  }

  const tags = await extractTagsFromProject(projectName)

  // Find markdown files
  const markdownFiles = files.filter((file) => file.name.toLowerCase().endsWith(".md") && file.download_url)

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
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
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
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        img: ({ node, ...props }) => (
                          <img {...props} className="rounded-lg max-w-full h-auto" loading="lazy" />
                        ),
                      }}
                    >
                      {md.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Content Message */}
        {markdownContents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No markdown files found in this project.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
