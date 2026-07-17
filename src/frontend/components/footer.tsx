import { Coffee, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface/50 py-8 mt-auto font-sans">
      <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-xs text-muted font-normal">
          AStrategy © {new Date().getFullYear()} — Guild of Strategists.
        </div>

        <a
          href="https://ko-fi.com/rebecamorais"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between gap-6 rounded-xl border border-border bg-brand-subtle px-4 py-2.5 transition-all hover:border-brand-light/30 hover:bg-brand-lighter/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5E5B]/10 text-[#FF5E5B]">
              <Coffee size={16} />
            </div>
            <span className="text-sm font-medium text-body">Support on Ko-fi</span>
          </div>
          <ExternalLink size={12} className="text-muted group-hover:text-brand-light transition-colors" />
        </a>
      </div>
    </footer>
  )
}
