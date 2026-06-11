import Link from "next/link";

const adminSections = [
  {
    title: "Orders",
    description: "New orders, delivery status, and customer requests.",
    href: "/business/orders",
  },
  {
    title: "Menu",
    description: "Food categories, prices, availability, and menu items.",
    href: "/business/menu",
  },
  {
    title: "Customers",
    description: "Customer contacts, order history, and notes.",
    href: "/business/customers",
  },
  {
    title: "CRM",
    description: "Paid CRM module: sklad, firms, debts, expenses, and reports.",
    href: "/business/crm",
  },
];

export default function BusinessDashboardPage() {
  return (
    <main className="min-h-screen bg-[#fff8df] px-4 py-6 text-[#3a2400] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-[#ead9a2] bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#b27b00]">
            JUTSU Business Admin
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">
                Restaurant admin panel
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-[#7a5a15] sm:text-base">
                Manage restaurant orders, menu, customers, and unlock the paid
                CRM module when the business needs sklad and deeper operations.
              </p>
            </div>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#ffbc0d] px-5 text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
              href="/business/crm"
            >
              Open CRM section
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminSections.map((section) => (
            <Link
              className="rounded-3xl border border-[#ead9a2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              href={section.href}
              key={section.title}
            >
              <h2 className="text-xl font-black">{section.title}</h2>
              <p className="mt-2 text-sm font-semibold text-[#7a5a15]">
                {section.description}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
