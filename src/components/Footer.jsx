export default function Footer() {
  return (
    <footer className="bg-deep-navy text-on-primary py-12 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-12 w-full max-w-[1280px] mx-auto">
        <div className="flex flex-col gap-3">
          <span className="font-headline text-xl font-bold text-surface-white">Hansol Vibe Coding</span>
          <p className="font-body text-sm text-surface-container-highest/70 max-w-xs">
            경영혁신팀이 운영하는 한솔제지 사내 바이브코딩 공유 플랫폼입니다.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-label text-sm font-bold text-surface-white uppercase tracking-wider">메뉴</h4>
          <nav className="flex flex-col gap-2">
            <a href="/" className="font-label text-xs text-surface-container-highest/70 hover:text-surface-white transition-colors">갤러리</a>
            <a href="/rankings" className="font-label text-xs text-surface-container-highest/70 hover:text-surface-white transition-colors">랭킹</a>
            <a href="/register" className="font-label text-xs text-surface-container-highest/70 hover:text-surface-white transition-colors">앱 등록</a>
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-label text-sm font-bold text-surface-white uppercase tracking-wider">문의</h4>
          <p className="font-label text-xs text-surface-container-highest/70">경영혁신팀</p>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 mt-10 pt-6 border-t border-surface-white/10 text-center">
        <p className="font-label text-xs text-surface-container-highest/50">© 2026 한솔제지 경영혁신팀. All rights reserved.</p>
      </div>
    </footer>
  )
}
