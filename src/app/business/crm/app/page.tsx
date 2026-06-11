"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getBusinessCrmState, resetBusinessCrmDemo } from "@/lib/business-crm";
import type { BusinessCrmState } from "@/lib/business-crm";

const stats = [
  { label: "Inventory items", value: "128" },
  { label: "Unpaid debts", value: "₩840k" },
  { label: "Supplier firms", value: "14" },
  { label: "Monthly expenses", value: "₩2.4M" },
];

const crmSections = [
  {
    title: "Inventory / Sklad",
    description: "Track products, quantity, units, QR fields, and low stock.",
    href: "/business/crm/app/inventory",
  },
  {
    title: "Firms",
    description: "Suppliers, purchase history, paid and unpaid status.",
    href: "/business/crm/app/firms",
  },
  {
    title: "Debts",
    description: "See unpaid purchases and customer/business debt records.",
    href: "/business/crm/app/debts",
  },
  {
    title: "Reports",
    description: "Sales, expenses, profit, and restaurant performance.",
    href: "/business/crm/app/reports",
  },
];

export default function BusinessCrmAppPage() {
  const router = useRouter();
  const [crmState, setCrmState] = useState<BusinessCrmState | null>(null);

  useEffect(() => {
    const currentState = getBusinessCrmState();
    setCrmState(currentState);

    if (!currentState.crmEnabled) {
      router.replace("/business/crm");
    }
  }, [router]);

  const activatedDate = useMemo(() => {
    if (!crmState?.activatedAt) {
      return "Demo active";
    }

    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(crmState.activatedAt));
  }, [crmState?.activatedAt]);

  const resetDemo = () => {
    resetBusinessCrmDemo();
    router.push("/business/crm");
  };

  if (!crmState?.crmEnabled) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#fff8df] px-4 py-6 text-[#3a2400] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-[#ead9a2] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                className="text-sm font-black text-[#b27b00] hover:text-[#3a2400]"
                href="/business/dashboard"
              >
                ← Back to business dashboard
              </Link>
              <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-[#b27b00]">
                crm-chayhana module inside JUTSU
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Restaurant CRM dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#7a5a15] sm:text-base">
                CRM is active for {crmState.businessName}. This is the internal
                CRM area that will receive the crm-chayhana sklad, firms,
                purchases, debts, QR code, and reports logic step by step.
              </p>
            </div>
            <div className="rounded-2xl bg-[#fff4c2] px-4 py-3 text-sm font-black text-[#7a5a15]">
              Plan: {crmState.crmPlan.toUpperCase()} · {activatedDate}
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              className="rounded-3xl border border-[#ead9a2] bg-white p-5 shadow-sm"
              key={item.label}
            >
              <p className="text-sm font-black text-[#7a5a15]">{item.label}</p>
              <p className="mt-2 text-3xl font-black">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {crmSections.map((section) => (
            <Link
              className="rounded-3xl border border-[#ead9a2] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              href={section.href}
              key={section.title}
            >
              <h2 className="text-2xl font-black">{section.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#7a5a15]">
                {section.description}
              </p>
            </Link>
          ))}
        </section>

        <section className="rounded-3xl border border-dashed border-[#d78a00] bg-[#fffdf5] p-6">
          <h2 className="text-xl font-black">Next development step</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#7a5a15]">
            Move the real crm-chayhana components into these CRM routes: firm
            list, purchase history, paid/unpaid status, inventory, and QR code
            fields. Keep them connected through a service layer so Django can
            replace localStorage later.
          </p>
          <button
            className="mt-4 rounded-2xl border border-[#ead9a2] bg-white px-4 py-3 text-sm font-black text-[#7a5a15]"
            onClick={resetDemo}
            type="button"
          >
            Reset demo CRM payment
          </button>
        </section>
      </div>
    </main>
  );
}
