import { useState } from 'react'
import { ConfigProvider, theme } from 'antd'

import { translations } from './services/translations'
import Header from './Composant/Header'
import Hero from './Composant/Hero'
import Commitments from './Composant/Commitments'
import ServicesGrid from './Composant/ServicesGrid'
import ProjectsGrid from './Composant/ProjectsGrid'
import Testimonials from './Composant/Testimonials'
import NewsGrid from './Composant/NewsGrid'
import Footer from './Composant/Footer'
import ChatWidget from './Composant/ChatWidget'

export default function App() {
  const [currentLang, setCurrentLang] = useState('EN')
  const [consultationOpen, setConsultationOpen] = useState(false)

  const t = translations[currentLang]

  const antTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#fbbf24',
      colorBgBase: '#020617',
      colorTextBase: '#f8fafc',
      borderRadius: 12,
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
      Button: {
        colorPrimary: '#fbbf24',
        colorPrimaryHover: '#fcd34d',
        colorText: '#020617',
      },
      Input: {
        colorBgContainer: 'rgba(255,255,255,0.05)',
        colorBorder: 'rgba(255,255,255,0.1)',
        colorTextPlaceholder: '#475569',
      },
      Select: {
        colorBgContainer: '#0f172a',
        colorBorder: 'rgba(255,255,255,0.1)',
      },
    },
  }

  return (
    <ConfigProvider theme={antTheme}>
      <div className="relative min-h-screen bg-slate-950 overflow-x-hidden">

        {/* Navigation header */}
        <Header
          currentLang={currentLang}
          setLang={setCurrentLang}
          t={t}
          onOpenConsultation={() => setConsultationOpen(true)}
        />

        <main>
          <Hero
            t={t}
            onOpenConsultation={() => setConsultationOpen(true)}
          />
          <Commitments t={t} />
          <ServicesGrid t={t} />
          <ProjectsGrid t={t} />
          <Testimonials t={t} />
          <NewsGrid t={t} />
        </main>

        {/* Footer */}
        <Footer 
          t={t} 
          onOpenConsultation={() => setConsultationOpen(true)} 
        />

        {/* Chat Widget */}
        <ChatWidget t={t} currentLang={currentLang} />
      </div>
    </ConfigProvider>
  )
}
