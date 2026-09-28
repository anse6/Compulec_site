import PageHeader from './PageHeader'
import ServiceCategoryBlock from './servicesComponents/ServiceCategoryBlock'
import rectImage  from '../assets/rect.png'
import rect1Image from '../assets/rect1.png'
import rect2Image from '../assets/rect2.png'
import rect8Image from '../assets/rect8.png'
import rect3Image from '../assets/rect3.png'
import rect9Image from '../assets/rect9.png'
import rect10Image from '../assets/rect10.png'
import rect11Image from '../assets/rect11.png'

// Order matches categories order in translations:
// 0: Digital Solutions → rect2.png
// 1: IT & Infrastructure → rect.png
// 2: Security → rect1.png
// 3: Infrastructures & Network → rect8.png
// 4: Energy Solutions → rect3.png
// 5: Conferencing Solution → rect9.png
// 6: Training → rect10.png
// 7: IT Service &Support → rect11.png
const categoryImages = [rect2Image, rectImage, rect1Image, rect8Image, rect3Image, rect9Image, rect10Image, rect11Image]

export default function ServicesPage({ t }) {
  const categories = t.services.categories

  return (
    <div className="w-full bg-white min-h-screen">
      {/* 1. Page Header (Réutilisable) */}
      <PageHeader 
        tagline={t.services.headerTagline}
        title={t.services.headerTitle}
        subtitle={t.services.headerSubtitle}
      />

      {/* 2. Service Category Blocks — Composant réutilisable */}
      {categories.map((category, index) => (
        <ServiceCategoryBlock 
          key={index}
          categoryTitle={category.title}
          categoryDesc={category.desc}
          bannerImage={categoryImages[index] || rectImage}
          items={category.items}
        />
      ))}
    </div>
  )
}
