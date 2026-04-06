import { OrderStatus, ORDER_STATUS_LABELS } from "@/types/order.types";
import clsx from "clsx";

const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.CREATED,
  OrderStatus.COOKING,
  OrderStatus.COURIER_ACCEPTED,
  OrderStatus.FROM_DELIVERYMAN,
  OrderStatus.DELIVERED,
];

const STATUS_ICONS: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: "📋",
  [OrderStatus.COOKING]: "🍳",
  [OrderStatus.COURIER_ACCEPTED]: "🤝",
  [OrderStatus.FROM_DELIVERYMAN]: "🚴",
  [OrderStatus.DELIVERED]: "✅",
};

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: "Заказ оформлен",
  [OrderStatus.COOKING]: "Готовится",
  [OrderStatus.COURIER_ACCEPTED]: "Курьер забрал",
  [OrderStatus.FROM_DELIVERYMAN]: "В пути",
  [OrderStatus.DELIVERED]: "Доставлен",
};

const getStatusIndex = (status: OrderStatus): number =>
  STATUS_FLOW.indexOf(status);

interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
  compact?: boolean;
}

export function OrderStatusStepper({
  currentStatus,
  compact = false,
}: OrderStatusStepperProps) {
  const currentIndex = getStatusIndex(currentStatus);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {STATUS_FLOW.map((status, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div
              key={status}
              className={clsx(
                "flex items-center gap-1.5",
                isCompleted && "opacity-40",
                isCurrent && "opacity-100",
                !isCompleted && !isCurrent && "opacity-25",
              )}
            >
              <span className="text-sm">{STATUS_ICONS[status]}</span>
              {i < STATUS_FLOW.length - 1 && (
                <span
                  className={clsx(
                    "w-3 h-px",
                    isCompleted ? "bg-emerald-500" : "bg-zinc-600",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-700" />
        {/* Filled line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
          style={{
            width: `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {STATUS_FLOW.map((status, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;

            return (
              <div
                key={status}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300",
                    isCompleted && "bg-emerald-500 text-white",
                    isCurrent &&
                      "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-zinc-700 text-zinc-500",
                  )}
                >
                  {STATUS_ICONS[status]}
                </div>
                <span
                  className={clsx(
                    "text-[10px] text-center leading-tight max-w-[60px]",
                    isCompleted && "text-emerald-400",
                    isCurrent && "text-zinc-200 font-medium",
                    !isCompleted && !isCurrent && "text-zinc-600",
                  )}
                >
                  {STATUS_DESCRIPTIONS[status]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current status badge */}
      <div className="flex items-center justify-center">
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium",
            currentStatus === OrderStatus.DELIVERED
              ? "bg-emerald-500/20 text-emerald-400"
              : currentStatus === OrderStatus.CREATED
                ? "bg-blue-500/20 text-blue-400"
                : currentStatus === OrderStatus.COOKING
                  ? "bg-yellow-500/20 text-yellow-400"
                  : currentStatus === OrderStatus.COURIER_ACCEPTED
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-purple-500/20 text-purple-400",
          )}
        >
          {ORDER_STATUS_LABELS[currentStatus]}
        </span>
      </div>
    </div>
  );
}
