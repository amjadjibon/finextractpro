export default function ExportsLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary h-10 w-10" />
      <span className="ml-4 text-muted-foreground">Loading exports…</span>
    </div>
  )
}
