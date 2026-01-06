import { Circle, ScanLine, Square, Triangle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/configs/axios";

interface LoaderStepsProps {
  projectId: string;
  onComplete?: () => void;
}

interface Step {
  icon: typeof Circle;
  label: string;
}

const steps: Step[] = [
  { icon: ScanLine, label: "Analyzing your request" },
  { icon: Square, label: "Enhancing your prompt" },
  { icon: Triangle, label: "Generating website code" },
  { icon: Circle, label: "Finalizing & optimizing" },
];

const LoaderSteps = ({ projectId, onComplete }: LoaderStepsProps) => {
  const [current, setCurrent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const pollConversation = async () => {
      try {
        const { data } = await api.get(`/api/user/project/${projectId}`);
        const conversation = data.project?.conversation || [];
        const code = data.project?.current_code;

        setMessages(conversation);

        const last = conversation[conversation.length - 1];
        if (last?.role === "assistant") {
          const content = last.content.toLowerCase();
          if (content.includes("enhanc")) setCurrent(1);
          if (content.includes("generat")) setCurrent(2);
          if (content.includes("final") || content.includes("preview")) setCurrent(3);
        }

        // Stop loader immediately if code exists
        if (code && !isComplete) {
          setIsComplete(true);
          clearInterval(interval);
          onComplete?.();
        }
      } catch (err) {
        console.error("Loader polling error:", err);
      }
    };

    pollConversation();
    interval = setInterval(pollConversation, 4000);

    return () => clearInterval(interval);
  }, [projectId, onComplete, isComplete]);

  const Icon = isComplete ? CheckCircle : steps[current].icon;
  const progress = isComplete ? 100 : ((current + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isComplete ? "bg-green-500/10 text-green-400" : "bg-indigo-500/10 text-indigo-400"
          }`}
        >
          <Icon className={`w-10 h-10 ${isComplete ? "" : "animate-spin"}`} />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-white mb-2">
        {isComplete ? "Website Ready 🎉" : steps[current].label}
      </h2>

      {/* Subtext */}
      {!isComplete && (
        <p className="text-gray-400 text-sm mb-4">
          Please don’t refresh. This usually takes 1–2 minutes.
        </p>
      )}

      {/* Backend Message */}
      {messages.length > 0 && (
        <div className="text-gray-300 text-sm italic mb-6">
          “{messages[messages.length - 1]?.content.slice(0, 120)}…”
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ${isComplete ? "bg-green-500" : "bg-indigo-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i <= current ? (isComplete ? "bg-green-400" : "bg-indigo-400") : "bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoaderSteps;
