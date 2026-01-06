import React from "react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "@/configs/axios"; // your axios instance
import { toast } from "sonner";

interface Plan {
  id: "basics" | "pro" | "enterprise";
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "basics",
    name: "Starter",
    price: "$5",
    features: [
      "100 AI credits",
      "Basic component builder",
      "NeonDB connection support",
      "Community assistance",
      "Standard generation speed",
    ],
  },
  {
    id: "pro",
    name: "Pro Builder",
    price: "$19",
    features: [
      "400 AI credits",
      "Advanced AI design & full-stack logic",
      "Instant PERN export + deploy",
      "Neon Postgres auto-schema generation",
      "Priority technical support",
      "Faster generation queue",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise AI",
    price: "$49",
    features: [
      "1000 AI credits",
      "Team collaboration dashboard",
      "Custom AI models training",
      "Dedicated cloud database setup",
      "24/7 VIP engineering support",
      "White-label solutions",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handlePurchase = async (planId: Plan["id"]) => {
    try {
      const res = await api.get(`/api/user/purchase-credits?planId=${planId}`);

      window.location.href = res.data.payment_link;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-20 px-4">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent text-center">
          Scale Your Ideas with AI Builder
        </h1>
        <p className="text-gray-400 mb-14 text-center max-w-2xl text-sm leading-relaxed">
          Generate complete full-stack websites, databases, and intelligent UI using AI automation.
        </p>

        {/* Plans */}
        <div className="grid gap-7 sm:grid-cols-1 md:grid-cols-3 max-w-7xl w-full">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all
                hover:-translate-y-2 hover:shadow-[0_15px_45px_rgba(203,82,212,0.25)]
                ${
                  plan.popular
                    ? "border-purple-500/60 bg-[#111126]"
                    : "border-slate-800 bg-[#0f0f1a]"
                }`}
            >
              {plan.popular && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-[#CB52D4] to-purple-600 px-3 py-1.5 text-[11px] rounded-full font-bold">
                  Most Popular
                </span>
              )}

              <h2 className="text-3xl font-bold mb-3">{plan.name}</h2>
              <p className="text-indigo-300 font-semibold mb-6 text-lg">
                {plan.price}
              </p>

              <ul className="flex-1 mb-8 space-y-3 text-gray-400 text-xs">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#CB52D4] rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-auto w-full py-3 rounded-xl font-bold text-xs transition-all
                  ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#CB52D4] to-indigo-600"
                      : "border border-gray-700 hover:border-[#CB52D4]"
                  }`}
                onClick={() =>
                  plan.id === "enterprise"
                    ? navigate("/contact")
                    : handlePurchase(plan.id)
                }
              >
                {plan.id === "enterprise" ? "Talk to Sales" : "Buy Credits"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-28">
        <Footer />
      </div>
    </div>
  );
};

export default Pricing;
