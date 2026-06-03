import { ArrowUp, ArrowUpRight, MoreHorizontal, Plus } from "lucide-react";
import QuickAction from "@/components/wallet/dashboard/QuickAction";

interface QuickActionsPanelProps {
  onAddFunds: () => void;
  onSend: () => void;
  onWithdraw: () => void;
  onMore: () => void;
}

export default function QuickActionsPanel({
  onAddFunds,
  onSend,
  onWithdraw,
  onMore,
}: QuickActionsPanelProps) {
  return (
    <section className="order-2 flex w-full items-start justify-start gap-2 xs:gap-3 md:grid md:grid-cols-4 md:content-start md:gap-3 md:rounded-xl md:border md:border-white/70 md:bg-white/60 md:p-4 md:shadow-sm md:shadow-primary-90/20 md:backdrop-blur-xl md:dark:border-white/10 md:dark:bg-transparent md:dark:shadow-none min-[900px]:order-none min-[900px]:col-span-full min-[900px]:!grid-cols-2 lg:p-5">
      <QuickAction
        icon={<Plus size={22} />}
        label="Add Funds"
        onClick={onAddFunds}
      />
      <QuickAction
        icon={<ArrowUpRight size={22} />}
        label="Send"
        onClick={onSend}
      />
      <QuickAction
        icon={<ArrowUp size={22} />}
        label="Withdraw"
        onClick={onWithdraw}
      />
      <QuickAction
        icon={<MoreHorizontal size={22} />}
        label="More"
        onClick={onMore}
      />
    </section>
  );
}
