// /src/components/LegalContainer.tsx
export default function LegalContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">{children}</div>
      </div>
    </main>
  );
}
