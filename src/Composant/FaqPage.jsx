import { useState, useEffect, useRef } from 'react'
import PageHeader from './PageHeader'

const FaqItem = ({ question, answer, isOpen, onToggle, delay, visible }) => {
  const contentRef = useRef(null)

  return (
    <div
      className={`border border-slate-100 rounded-xl overflow-hidden transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${isOpen ? 'bg-slate-50 border-l-4 border-l-[#023B6A]' : 'bg-white hover:bg-slate-50'}`}
      style={{
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background-color 0.3s ease, border 0.3s ease`,
      }}
    >
      {/* Question */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-8 py-5 cursor-pointer text-left"
      >
        <span
          className={`text-[0.95rem] font-bold transition-colors duration-200 ${
            isOpen ? 'text-[#023B6A]' : 'text-[#023B6A]'
          }`}
        >
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg font-bold transition-all duration-300 ${
            isOpen
              ? 'bg-[#023B6A] rotate-0'
              : 'bg-[#023B6A] rotate-0'
          }`}
        >
          {isOpen ? '×' : '+'}
        </span>
      </button>

      {/* Answer */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight + 'px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-8 pb-6">
          <p className="text-[#023B6A] text-sm leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FaqPage({ t }) {
  const [openIndex, setOpenIndex] = useState(-1)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const content = t.faqPage

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <PageHeader
        tagline={content.headerTagline}
        title={content.headerTitle}
        subtitle={content.headerSubtitle}
      />

      <section
        ref={sectionRef}
        className="py-16 px-8 sm:px-16 lg:px-24 xl:px-48 bg-white"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          {content.items.map((item, index) => (
            <FaqItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? -1 : index)
              }
              delay={index * 80}
              visible={visible}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
