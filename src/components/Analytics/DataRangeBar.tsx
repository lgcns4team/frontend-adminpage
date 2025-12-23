import { Button } from "../ui/Button";
import { useMemo } from "react";

export type Preset = "today" | "yesterday" | "custom";

type Props = {
  preset: Preset;
  start: string;
  end: string;
  onChangePreset: (p: Preset) => void;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onApply: () => void;
};

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DateRangeBar({
  preset,
  start,
  end,
  onChangePreset,
  onChangeStart,
  onChangeEnd,
  onApply,
}: Props) {
  const hint = useMemo(() => {
    if (preset === "today") return `오늘(${todayStr()})`;
    if (preset === "yesterday") return `어제(${yesterdayStr()})`;
    return `${start || "시작일"} ~ ${end || "종료일"}`;
  }, [preset, start, end]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant={preset === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => onChangePreset("today")}
        >
          오늘
        </Button>
        <Button
          variant={preset === "yesterday" ? "default" : "outline"}
          size="sm"
          onClick={() => onChangePreset("yesterday")}
        >
          어제
        </Button>
        <Button
          variant={preset === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => onChangePreset("custom")}
        >
          기간 설정
        </Button>

        <span className="ml-2 text-sm text-gray-500">{hint}</span>
      </div>

      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={start}
            onChange={(e) => onChangeStart(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          />
          <span className="text-sm text-gray-500">~</span>
          <input
            type="date"
            value={end}
            onChange={(e) => onChangeEnd(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          />
          <Button size="sm" onClick={onApply}>
            적용
          </Button>
        </div>
      )}
    </div>
  );
}
