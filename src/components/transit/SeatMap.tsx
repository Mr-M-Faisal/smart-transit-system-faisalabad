import { cn } from "@/lib/utils";
import { seatLayout } from "@/lib/transit/utils";

export function SeatMap({
  capacity,
  occupiedSeats,
  selected,
  onToggle,
  maxSelect = 4,
}: {
  capacity: number;
  occupiedSeats: string[];
  selected: string[];
  onToggle: (seat: string) => void;
  maxSelect?: number;
}) {
  const rows = seatLayout(capacity);

  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-xs rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
          <span>Driver</span>
          <span>Front door</span>
        </div>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center justify-center gap-2">
              {row.slice(0, 2).map((seat) => (
                <Seat
                  key={seat}
                  seat={seat}
                  occupied={occupiedSeats.includes(seat)}
                  selected={selected.includes(seat)}
                  disabled={!selected.includes(seat) && selected.length >= maxSelect}
                  onToggle={onToggle}
                />
              ))}
              <span className="num w-6 text-center text-[10px] text-muted-foreground">{i + 1}</span>
              {row.slice(2).map((seat) => (
                <Seat
                  key={seat}
                  seat={seat}
                  occupied={occupiedSeats.includes(seat)}
                  selected={selected.includes(seat)}
                  disabled={!selected.includes(seat) && selected.length >= maxSelect}
                  onToggle={onToggle}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <Legend className="border-border bg-card" label="Available" />
        <Legend className="border-primary bg-primary" label="Selected" />
        <Legend className="border-transparent bg-muted" label="Occupied" />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-4 rounded-md border", className)} />
      {label}
    </span>
  );
}

function Seat({
  seat,
  occupied,
  selected,
  disabled,
  onToggle,
}: {
  seat: string;
  occupied: boolean;
  selected: boolean;
  disabled: boolean;
  onToggle: (seat: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={occupied || disabled}
      onClick={() => onToggle(seat)}
      aria-label={`Seat ${seat}${occupied ? " occupied" : ""}`}
      className={cn(
        "num size-8 rounded-md border text-[10px] font-semibold transition-all",
        occupied && "cursor-not-allowed border-transparent bg-muted text-muted-foreground/60",
        !occupied &&
          !selected &&
          "border-border bg-card text-foreground hover:border-primary hover:bg-primary-soft",
        selected && "border-primary bg-primary text-primary-foreground",
        disabled && !selected && !occupied && "cursor-not-allowed opacity-50",
      )}
    >
      {seat}
    </button>
  );
}
