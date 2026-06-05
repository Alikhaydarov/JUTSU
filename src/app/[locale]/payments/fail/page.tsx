import Link from "next/link";
import { normalizeLocale } from "@/lib/i18n";

type FailPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
};

export default async function PaymentFailPage({
  params,
  searchParams,
}: FailPageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const { code, message, orderId } = await searchParams;

  return (
    <main className="min-h-screen bg-[#fff8df] px-4 py-8 text-[#3a2400]">
      <section className="mx-auto max-w-2xl rounded-lg border border-[#ead9a2] bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase text-[#b91c1c]">
          Payment failed
        </p>
        <h1 className="mt-2 text-3xl font-black">Toss payment was not completed</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#7a5a15]">
          The order should stay unpaid. The user can return to checkout and try
          another payment method.
        </p>
        <dl className="mt-5 grid gap-2 text-sm">
          <PaymentRow label="orderId" value={orderId} />
          <PaymentRow label="code" value={code} />
          <PaymentRow label="message" value={message} />
        </dl>
        <Link
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#ffbc0d] px-4 text-sm font-black text-[#3a2400]"
          href={`/${locale}`}
        >
          Back to JUTSU
        </Link>
      </section>
    </main>
  );
}

function PaymentRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-lg border border-[#f0df9f] bg-[#fffdf5] px-3 py-2">
      <dt className="font-bold text-[#7a5a15]">{label}</dt>
      <dd className="mt-1 break-all font-black">{value ?? "-"}</dd>
    </div>
  );
}
