export default function Footer() {
  return (
    <footer className="bg-deep-navy text-on-primary py-12 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-12 w-full max-w-[1280px] mx-auto">
        <div className="flex flex-col gap-3">
          <span className="font-headline text-xl font-bold text-surface-white">Vibe Coding</span>
          <p className="font-body text-sm text-surface-container-highest/70 max-w-xs">
            코딩의 가치를 넘어 새로운 경험을 디자인합니다. 바이브코딩은 혁신적인 기술 공유 문화를 선도합니다.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-label text-sm font-bold text-surface-white uppercase tracking-wider">Quick Links</h4>
          <nav className="flex flex-col gap-2">
            <a href="#" className="font-label text-xs text-surface-container-highest/70 hover:text-surface-white transition-colors">회사 소개</a>
            <a href="#" className="font-label text-xs text-surface-container-highest/70 hover:text-surface-white transition-colors">이용약관</a>
            <a href="#" className="font-label text-xs text-surface-container-highest/70 hover:text-surface-white transition-colors">개인정보처리방침</a>
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-label text-sm font-bold text-surface-white uppercase tracking-wider">Contact</h4>
          <p className="font-label text-xs text-surface-container-highest/70">support@vibecoding.portal</p>
          <div className="flex gap-4 mt-1">
            <a href="#" className="text-surface-container-highest/70 hover:text-surface-white transition-colors"><span className="material-symbols-outlined text-xl">public</span></a>
            <a href="#" className="text-surface-container-highest/70 hover:text-surface-white transition-colors"><span className="material-symbols-outlined text-xl">alternate_email</span></a>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 mt-10 pt-6 border-t border-surface-white/10 text-center">
        <p className="font-label text-xs text-surface-container-highest/50">© 2024 Vibe Coding Portal. All rights reserved.</p>
      </div>
    </footer>
  )
}
