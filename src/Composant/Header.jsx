import { useState, useEffect } from 'react'
import { DownOutlined, SearchOutlined, MenuOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons'
import logo from '../assets/logo.png'

export default function Header({ currentLang, setLang, t, onOpenConsultation }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Detect scroll to apply solid background to glassmorphism header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dropdowns = {
    about: {
      EN: [
        { label: 'Company Overview', href: '#about' },
        { label: 'Our Credentials & Certifications', href: '#credentials' },
        { label: 'Careers at Compulec', href: '#careers' },
      ],
      FR: [
        { label: 'Présentation de l\'entreprise', href: '#about' },
        { label: 'Nos Certifications & Agréments', href: '#credentials' },
        { label: 'Carrières chez Compulec', href: '#careers' },
      ]
    },
    services: {
      EN: [
        { label: 'IT Infrastructure', href: '#services' },
        { label: 'Cybersecurity & Audit', href: '#services' },
        { label: 'Surveillance & Access Control', href: '#services' },
        { label: 'Software Engineering', href: '#services' },
        { label: 'Electrical & Solar Energy', href: '#services' },
      ],
      FR: [
        { label: 'Infrastructure IT', href: '#services' },
        { label: 'Cybersécurité & Audit', href: '#services' },
        { label: 'Surveillance & Contrôle d\'Accès', href: '#services' },
        { label: 'Génie Logiciel', href: '#services' },
        { label: 'Énergie Électrique & Solaire', href: '#services' },
      ]
    },
    resources: {
      EN: [
        { label: 'Technical Documentation', href: '#resources' },
        { label: 'Case Studies', href: '#projects' },
        { label: 'Security Bulletins', href: '#resources' },
      ],
      FR: [
        { label: 'Documentation Technique', href: '#resources' },
        { label: 'Études de Cas', href: '#projects' },
        { label: 'Bulletins de Sécurité', href: '#resources' },
      ]
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      alert(`Search feature: searching for "${searchQuery}" in our system...`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-slate-200 shadow-sm ${
        scrolled ? 'py-3' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <img
              src={logo}
              alt="Compulec Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
              {t.nav.home}
            </a>

            {/* About Dropdown */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 cursor-pointer">
                {t.nav.about} <DownOutlined className="text-[10px] transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-60 rounded-xl bg-white border border-slate-100 shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                {dropdowns.about[currentLang].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Services Dropdown */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 cursor-pointer">
                {t.nav.services} <DownOutlined className="text-[10px] transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-64 rounded-xl bg-white border border-slate-100 shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                {dropdowns.services[currentLang].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <a href="#projects" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
              {t.nav.projects}
            </a>

            {/* Resources Dropdown */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 cursor-pointer">
                {t.nav.resources} <DownOutlined className="text-[10px] transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-60 rounded-xl bg-white border border-slate-100 shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                {dropdowns.resources[currentLang].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Desktop Right Panel (Search, Contact, CTA, Lang) */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Search Trigger */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-slate-500 hover:text-slate-900 transition-colors duration-200 p-1 cursor-pointer"
                aria-label="Search"
              >
                <SearchOutlined className="text-lg" />
              </button>
              
              {searchOpen && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 top-full mt-2 w-72 p-2 rounded-xl bg-white border border-slate-200 shadow-2xl flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={currentLang === 'EN' ? 'Search...' : 'Recherche...'}
                    className="flex-1 bg-slate-50 text-sm text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  <button type="submit" className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer">
                    Go
                  </button>
                </form>
              )}
            </div>

            {/* Contact Us */}
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
              {t.nav.contact}
            </a>

            {/* Request Consultation CTA */}
            <button
              onClick={onOpenConsultation}
              className="text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-lg shadow-lg hover:shadow-amber-400/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              {t.nav.cta}
            </button>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all cursor-pointer">
                <GlobalOutlined className="text-xs" />
                <span>{currentLang}</span>
                <DownOutlined className="text-[8px] transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-white border border-slate-100 shadow-xl p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                {['EN', 'FR'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLang(lang)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      currentLang === lang
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {lang === 'EN' ? 'English (EN)' : 'Français (FR)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Menu & Search Actions */}
          <div className="flex lg:hidden items-center gap-4">
            {/* Search Trigger Mobile */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen)
                if (mobileMenuOpen) setMobileMenuOpen(false)
              }}
              className="text-slate-500 hover:text-slate-900 transition-colors duration-200 p-1"
            >
              <SearchOutlined className="text-lg" />
            </button>

            {/* Language switch quick button */}
            <button
              onClick={() => setLang(currentLang === 'EN' ? 'FR' : 'EN')}
              className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md"
            >
              {currentLang}
            </button>

            {/* Menu Hamburger */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen)
                if (searchOpen) setSearchOpen(false)
              }}
              className="text-slate-600 hover:text-slate-900 transition-colors duration-200 p-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
            </button>
          </div>

        </div>
      </div>

      {/* Floating Mobile Search bar */}
      {searchOpen && (
        <div className="lg:hidden bg-white border-b border-slate-100 px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLang === 'EN' ? 'Search for services, projects...' : 'Rechercher des services, projets...'}
              className="flex-1 bg-slate-50 text-sm text-slate-800 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400"
            />
            <button type="submit" className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-lg text-sm">
              {currentLang === 'EN' ? 'Search' : 'Chercher'}
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bottom-0 z-40 bg-white border-t border-slate-100 flex flex-col p-6 overflow-y-auto">
          <nav className="flex flex-col gap-6 mb-8">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-slate-900 border-b border-slate-100 pb-2"
            >
              {t.nav.home}
            </a>

            {/* Mobile About */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.nav.about}</span>
              {dropdowns.about[currentLang].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="pl-3 text-base text-slate-600 hover:text-slate-900"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Mobile Services */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.nav.services}</span>
              {dropdowns.services[currentLang].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="pl-3 text-base text-slate-600 hover:text-slate-900"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-slate-900 border-b border-slate-100 pb-2"
            >
              {t.nav.projects}
            </a>

            {/* Mobile Resources */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.nav.resources}</span>
              {dropdowns.resources[currentLang].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="pl-3 text-base text-slate-600 hover:text-slate-900"
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-slate-900 border-b border-slate-100 pb-2"
            >
              {t.nav.contact}
            </a>
          </nav>

          {/* Action button inside mobile menu */}
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenConsultation()
            }}
            className="w-full text-center bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl shadow-sm mt-auto"
          >
            {t.nav.cta}
          </button>
        </div>
      )}
    </header>
  )
}
