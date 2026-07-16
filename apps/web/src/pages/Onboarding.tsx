import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, MessageCircle, Store, ChevronRight } from "lucide-react";
import { Button } from "@katenda_clients/ui";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  const slides = [
    { icon: ShoppingBag, title: t("welcome.s1.title"), sub: t("welcome.s1.sub"), color: "from-brand/40 to-brand/5" },
    { icon: MessageCircle, title: t("welcome.s2.title"), sub: t("welcome.s2.sub"), color: "from-accent/40 to-accent/5" },
    { icon: Store, title: t("welcome.s3.title"), sub: t("welcome.s3.sub"), color: "from-brand/40 via-accent/20 to-accent/10" },
  ];

  const slide = slides[step];
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-brand grid place-items-center font-black text-brand-foreground">K</div>
          <span className="font-bold">Katenda</span>
        </div>
        <button onClick={() => navigate("/login")} className="text-sm text-muted-foreground hover:text-foreground">
          {t("welcome.skip")}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto w-full">
        <div className={cn("relative h-64 w-64 rounded-[3rem] grid place-items-center mb-10 bg-gradient-to-br", slide.color)}>
          <div className="absolute inset-0 rounded-[3rem] bg-card/40 backdrop-blur-sm" />
          <Icon className="relative h-24 w-24 text-brand" strokeWidth={1.5} />
          <div className="absolute -bottom-3 -right-3 h-14 w-14 rounded-2xl bg-accent text-accent-foreground grid place-items-center font-black text-xl rotate-12">
            K
          </div>
        </div>
        <h1 key={`t-${step}`} className="text-3xl font-bold tracking-tight fade-up">{slide.title}</h1>
        <p key={`s-${step}`} className="text-muted-foreground mt-3 leading-relaxed fade-up">{slide.sub}</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <span key={i} className={cn("h-2 rounded-full transition-all", i === step ? "w-8 bg-brand" : "w-2 bg-muted")} />
          ))}
        </div>
        <Button
          onClick={() => { if (isLast) navigate("/login"); else setStep(step + 1); }}
          className="w-full h-14 bg-accent text-accent-foreground hover:opacity-90 font-semibold text-base rounded-2xl shadow-xl shadow-accent/20"
        >
          {isLast ? t("welcome.start") : t("welcome.next")}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
