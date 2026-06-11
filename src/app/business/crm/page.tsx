"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { activateBusinessCrm, getBusinessCrmState } from "@/lib/business-crm";
import type { BusinessCrmState } from "@/lib/business-crm";

const crmFeatures = [
  "Sklad and inventory control",
  "Firms and supplier purchase history",
  "Paid / unpaid debt tracking",
  "QR code product fields",
  "Expenses and profit reports",
  "Customer CRM notes",
];

export default function BusinessCrmGatePage() {
  const router = useRouter();
  const [crmState, setCrmState] = useState<BusinessCrmState | null>(null);

  useEffect(() => {
    const currentState = getBusinessCrmState();
    setCrmState(currentState);

    if (currentState.crmEnabled) {
      router.replace("/business/crm/app");
    }
  }, [router]);

  const activateCrm = () => {
    activateBusinessCrm("basic");
    router.push("/business/crm/app");
  };

  return (
    <main className="min-h-screen bg-[#fff8df] px-4 py-6 text-[#3a2400] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <section className="rounded-3xl border border-[#ead9a2] bg-white p-6 shadow-sm sm:p-8">
          <Link
            className="text-sm font-black text-[#b27b00] hover:text-[#3a2400]"
            href="/business/dashboard"
          >
            ← Back to business dashboard
          </Link>
          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#b27b00]">
              Paid CRM module
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Unlock JUTSU CRM for your restaurant
            </h1>
            <p className="mt-4 text-base font-semibold leading-7 text-[#7a5a15]">
              This CRM is an optional paid module for restaurant owners. If the
              business pays for CRM, it opens a separate internal CRM page based
              on the crm-chayhana system: sklad, firms, debts, QR product fields,
              and reports.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {crmFeatures.map((feature) => (
              <div
                className="rounded-2xl border border-[#ead9a2] bg-[#fffdf5] p-4 text-sm font-black"
                key={feature}
              >
                ✓ {feature}
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-[#ead9a2] bg-[#3a2400] p-6 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#ffdc72]">
            CRM status
          </p>
          <h2 className="mt-3 text-3xl font-black">
            {crmState?.crmEnabled ? "Active" : "Locked"}
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#fff1bd]">
            Current demo business: {crmState?.businessName ?? "Loading..."}
          </p>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-sm font-black text-[#ffdc72]">Basic CRM plan</p>
            <p className="mt-2 text-4xl font-black">₩29,000</p>
            <p className="mt-1 text-sm font-semibold text-[#fff1bd]">
              Demo price for architecture. Real payment will be connected later
              through Django and a Korean payment gateway.
            </p>
          </div>

          <button
            className="mt-6 h-12 w-full rounded-2xl bg-[#ffbc0d] text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
            onClick={activateCrm}
            type="button"
          >
            Demo Activate CRM
          </button>
          <p className="mt-3 text-xs font-semibold leading-5 text-[#fff1bd]">
            For now this button saves crmEnabled=true in localStorage. Later it
            should call Django subscription/payment API.
          </p>
        </aside>
      </div>
    </main>
  );
}
