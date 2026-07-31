import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Share2,
  MessageCircle,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { MobileShell } from '@/components/MobileShell'
import { useI18n } from '@/lib/i18n'

export const Route = createFileRoute('/')({
  component: WelcomePage,
})

function WelcomePage() {
  const { t, lang, setLang } = useI18n()
  const [step, setStep] = useState(0)
  const slides = [
    {
      icon: Sparkles,
      title: t('onb.1.title'),
      sub: t('onb.1.sub'),
      color: 'from-primary/30 to-primary/0',
    },
    {
      icon: Share2,
      title: t('onb.2.title'),
      sub: t('onb.2.sub'),
      color: 'from-accent/30 to-accent/0',
    },
    {
      icon: MessageCircle,
      title: t('onb.3.title'),
      sub: t('onb.3.sub'),
      color: 'from-primary/30 to-accent/10',
    },
  ]

  const showWelcome = step === 0
  const slideIndex = step - 1

  return (
    <MobileShell hideNav>
      <div className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 gradient-mesh opacity-80 pointer-events-none" />
        <header className="relative flex items-center justify-between p-5">
          <Logo />
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-elevated/70 backdrop-blur border border-border"
          >
            {lang.toUpperCase()}
          </button>
        </header>

        <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
          {showWelcome ? (
            <div key="welcome" className="space-y-6 animate-onb-fade-up">
              <div className="mx-auto w-40 h-40 rounded-[2rem] gradient-brand grid place-items-center shadow-pop animate-onb-spring">
                <span className="font-display font-extrabold text-7xl text-primary-foreground">
                  K
                </span>
              </div>
              <div>
                <h1 className="font-display font-extrabold text-4xl leading-tight">
                  Katenda
                </h1>
                <p className="mt-2 text-lg text-foreground/80 italic font-display">
                  "{t('app.tagline')}"
                </p>
                <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>
          ) : (
            <div
              key={`slide-${slideIndex}`}
              className="space-y-6 w-full animate-onb-slide-in"
            >
              <div
                className={`mx-auto w-44 h-44 rounded-[2rem] grid place-items-center bg-gradient-to-br ${slides[slideIndex].color} border border-border shadow-soft`}
              >
                {(() => {
                  const Icon = slides[slideIndex].icon
                  return (
                    <Icon className="size-20 text-primary" strokeWidth={1.5} />
                  )
                })()}
              </div>
              <div>
                <h2 className="font-display font-bold text-3xl">
                  {slides[slideIndex].title}
                </h2>
                <p className="mt-3 text-muted-foreground max-w-xs mx-auto">
                  {slides[slideIndex].sub}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="relative px-6 pb-10 space-y-5">
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-primary' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          {step < 3 ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(3)}
                className="text-sm text-muted-foreground font-medium px-3 py-2"
              >
                {t('cta.skip')}
              </button>
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
              >
                {t('cta.next')}
                <ChevronRight className="size-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                to="/auth/register"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
              >
                {t('cta.start')}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                to="/auth/login"
                className="block w-full text-center py-3 rounded-2xl border border-border bg-surface-elevated/60 backdrop-blur font-medium"
              >
                {t('cta.login')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  )
}
