"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export type AnalyticsFiltersProps = {
  campaigns: { id: string; name: string }[];
  selectedCampaignId: string;
  rangeDays: number;
};

export default function AnalyticsFilters({
  campaigns,
  selectedCampaignId,
  rangeDays,
}: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [campaign, setCampaign] = useState(selectedCampaignId);

  const baseParams = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("range", String(rangeDays));
    return params;
  }, [searchParams, rangeDays]);

  const handleApply = () => {
    const params = new URLSearchParams(baseParams);
    params.set("campaign", campaign);
    router.replace(`/dashboard/analytics?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={campaign}
        onChange={(event) => setCampaign(event.target.value)}
        className="h-9 rounded-md border border-white/10 bg-[var(--rk-surface-2)] px-3 text-xs text-[var(--rk-text)]"
      >
        {campaigns.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <Button size="sm" type="button" variant="outline" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}
