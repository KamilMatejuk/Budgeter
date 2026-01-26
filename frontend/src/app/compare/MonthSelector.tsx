'use client';

import { getMonthName } from "@/const/date";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { pushSelectorsToUrl } from "./utils";

export type Range = {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
};

type Item = {
  month: number;
  year: number;
}

interface MonthSelectorProps {
  data: Item[];
  selectedRanges: Range[];
  setSelectedRanges: Dispatch<SetStateAction<Range[]>>;
}

function dateFromEvent(e: React.MouseEvent, container: HTMLDivElement, items: Item[]) {
  const rect = container.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  const idx = Math.min(items.length - 1, Math.max(0, Math.floor(ratio * items.length)));
  return { month: items[idx].month, year: items[idx].year };
}

function validateOverlappingRanges(ranges: Range[], date: Item) {
  return ranges.findIndex(r => {
    const startIdx = r.startYear * 12 + r.startMonth;
    const endIdx = r.endYear * 12 + r.endMonth;
    const dateIdx = date.year * 12 + date.month;
    return dateIdx >= startIdx && dateIdx <= endIdx;
  });
}

function pushRangesToUrl(ranges: Range[]) {
  const params = pushSelectorsToUrl({
    dates: ranges.map(r => (
      { start: new Date(r.startYear, r.startMonth - 1), end: new Date(r.endYear, r.endMonth - 1) }
    ))
  });
  const query = params.toString();
  const newUrl = `${window.location.pathname}?${query}`;
  window.history.replaceState(null, "", newUrl);
}

export default function MonthSelector({ data, selectedRanges, setSelectedRanges }: MonthSelectorProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<Range | null>(null);

  function onMouseDown(e: React.MouseEvent) {
    const date = dateFromEvent(e, trackRef.current!, data);
    const overlapping = validateOverlappingRanges(selectedRanges, date);
    if (overlapping !== -1) {
      const newRanges = selectedRanges.filter((_, i) => i !== overlapping);
      setSelectedRanges(newRanges);
      pushRangesToUrl(newRanges);
    } else {
      setDraft({ startMonth: date.month, startYear: date.year, endMonth: date.month, endYear: date.year });
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!draft) return;
    const date = dateFromEvent(e, trackRef.current!, data);
    if (validateOverlappingRanges(selectedRanges, date) !== -1) {
      setDraft(null);
    } else {
      setDraft((d) => ({ ...d!, endMonth: date.month, endYear: date.year }));
    }
  }

  function onMouseUp() {
    if (!draft) return;
    const correctDraftOrder = draft.startYear * 12 + draft.startMonth <= draft.endYear * 12 + draft.endMonth
      ? draft
      : { startMonth: draft.endMonth, startYear: draft.endYear, endMonth: draft.startMonth, endYear: draft.startYear };
    const newRanges = [...selectedRanges, correctDraftOrder].sort((a, b) => {
      const aIdx = a.startYear * 12 + a.startMonth;
      const bIdx = b.startYear * 12 + b.startMonth;
      return aIdx - bIdx;
    });
    setSelectedRanges(newRanges);
    pushRangesToUrl(newRanges);
    setDraft(null);
  }

  function rangeToStyle(startMonth: number, startYear: number, endMonth: number, endYear: number) {
    const startIdx = data.findIndex((d) => d.month === startMonth && d.year === startYear);
    const endIdx = data.findIndex((d) => d.month === endMonth && d.year === endYear);
    const first = startIdx < endIdx ? startIdx : endIdx;
    const last = startIdx > endIdx ? startIdx : endIdx;
    const sectionWidth = 100 / data.length;
    const margin = sectionWidth / 50;
    return {
      left: `${first * sectionWidth + margin}%`,
      width: `${(last - first + 1) * sectionWidth - 2 * margin}%`,
    };
  }

  return (
    <>
      <div
        ref={trackRef}
        className="ml-12 relative h-8 bg-second-bg rounded select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}>
        {selectedRanges.map((r, i) => (
          <div
            key={i}
            className="absolute top-1 bottom-1 bg-positive rounded"
            style={rangeToStyle(r.startMonth, r.startYear, r.endMonth, r.endYear)}
          />
        ))}
        {draft && (
          <div
            className="absolute top-1 bottom-1 bg-positive/40 rounded"
            style={rangeToStyle(draft.startMonth, draft.startYear, draft.endMonth, draft.endYear)}
          />
        )}
      </div>
      <div className="ml-12 flex">
        {data.map(d => (
          <p
            key={d.year + '-' + d.month}
            className="flex-1 text-center text-xs text-subtext"
          >
            {getMonthName(d.month) + ' ' + d.year}
          </p>
        ))}
      </div>
    </>
  );
}
