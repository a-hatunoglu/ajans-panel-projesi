import { BillingAlert } from "../types";

export function BillingAlerts({ items }: { items: BillingAlert[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="border border-white/5 rounded-xl bg-zinc-950 divide-y divide-white/5">
      {items.map((item) => (
        <div key={item.id} className="p-4 flex justify-between items-center gap-4 hover:bg-zinc-900/30 transition-colors">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-zinc-200 truncate">{item.companyName}</span>
            <span className={`text-xs mt-0.5 ${item.status === 'OVERDUE' ? 'text-red-400' : 'text-zinc-400'}`}>
              Due: {item.dueDate}
            </span>
          </div>
          <div className="text-sm font-semibold tabular-nums text-zinc-100 shrink-0">
            ${item.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
