import { ActivityItem } from "../types";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center border border-white/5 rounded-xl bg-zinc-950">
        <p className="text-sm text-zinc-500">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="border border-white/5 rounded-xl bg-zinc-950 p-5 space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3 text-sm">
          <div className="relative flex-none w-1.5 h-1.5 mt-1.5 rounded-full bg-zinc-700" />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-zinc-300 leading-snug">
              <span className="font-medium text-zinc-100">{item.user}</span> {item.action}{" "}
              <span className="text-zinc-400">{item.target}</span>
            </p>
            <p className="text-xs text-zinc-500">{item.timeAgo}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
