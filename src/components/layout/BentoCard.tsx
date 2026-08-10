// src/components/layout/BentoCard.tsx
export function BentoCard({
  title,
  className = '',
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
    return (
        <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
            {title && <h3 className="mb-3 text-sm font-medium text-zinc-400">{title}</h3>}
            {children}
        </div>
    );
}
