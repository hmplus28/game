/**
 * Mobile Arena tutorial: short, actionable guidance shown one step at a time
 * so players can learn while staying inside the game flow.
 */
import { Check, ChevronLeft, Dices, Footprints, Goal, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const steps = [
  { icon: Dices, title: "هدف بازی", copy: "چهار مهرهٔ خودت را پیش از حریفان به خانهٔ مرکزی برسان. هر حرکت با تاس آغاز می‌شود." },
  { icon: Sparkles, title: "پرتاب تاس", copy: "روی «پرتاب تاس» بزن. تاس متوقف می‌شود و تعداد خانه‌هایی را که می‌توانی حرکت کنی نشان می‌دهد." },
  { icon: Footprints, title: "انتخاب مهره", copy: "مهرهٔ درخشان را لمس کن. مسیر طی‌شده روی صفحه روشن می‌شود و مهره خانه‌به‌خانه حرکت می‌کند." },
  { icon: Goal, title: "بردن راند", copy: "مهره‌ها را ایمن حرکت بده، با ۶ مهرهٔ جدید را وارد مسیر کن و آن‌ها را به مرکز برسان." },
];

export function GameTutorial({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const finish = () => {
    setStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tutorial-dialog" showCloseButton={false} dir="rtl">
        <DialogHeader className="tutorial-header">
          <div className="tutorial-icon"><Icon size={23} /></div>
          <span className="tutorial-count">{step + 1} از {steps.length}</span>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription>{current.copy}</DialogDescription>
        </DialogHeader>
        <div className="tutorial-progress" aria-label={`مرحله ${step + 1} از ${steps.length}`}><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <div className="tutorial-steps">{steps.map((item, index) => <span key={item.title} className={index <= step ? "is-complete" : ""}>{index < step ? <Check size={11} /> : index + 1}</span>)}</div>
        <footer className="tutorial-actions">
          <button className="surface-button" onClick={finish}>بعداً یاد می‌گیرم</button>
          <button className="primary-button" onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === steps.length - 1 ? "شروع بازی" : <>بعدی <ChevronLeft size={16} /></>}</button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
