import { Building, MapPin } from "lucide-react";
import { useGetList, useListFilterContext } from "ra-core";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { sizes } from "../companies/sizes";

const COMPANY_IN_FILTER = "company_id@in";

function buildInValue(ids: string[]): string {
  return `(${ids.join(",")})`;
}

/**
 * Combined city + company-size filter for the Deals list.
 *
 * Since deals don't have city/size columns, both filters translate to
 * a `company_id@in=(...)` PostgREST filter using the IDs of matching companies.
 * Options are sorted by deal count (most cards first).
 * Selecting both city AND size applies their intersection.
 */
export const DealCompanyFilter = (_: { source: string; alwaysOn?: boolean }) => {
  const { filterValues, displayedFilters, setFilters } = useListFilterContext();

  // Ref so event handlers always read fresh filterValues without
  // being listed as a dependency (avoids infinite loops).
  const filterValuesRef = useRef(filterValues);
  filterValuesRef.current = filterValues;

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const { data: companies } = useGetList("companies", {
    pagination: { page: 1, perPage: 1000 },
  });

  const { data: allDeals } = useGetList("deals", {
    pagination: { page: 1, perPage: 1000 },
    filter: { "archived_at@is": null },
  });

  const { sortedCities, sortedSizes, cityToIds, sizeToIds } = useMemo(() => {
    const companyToCity: Record<string, string> = {};
    const companyToSize: Record<string, number> = {};
    const cityToIds: Record<string, string[]> = {};
    const sizeToIds: Record<number, string[]> = {};

    for (const c of companies ?? []) {
      if (c.city) {
        companyToCity[String(c.id)] = c.city;
        (cityToIds[c.city] ??= []).push(String(c.id));
      }
      if (c.size != null) {
        companyToSize[String(c.id)] = c.size;
        (sizeToIds[c.size] ??= []).push(String(c.id));
      }
    }

    const cityDealCounts: Record<string, number> = {};
    const sizeDealCounts: Record<number, number> = {};

    for (const deal of allDeals ?? []) {
      const cid = String(deal.company_id);
      const city = companyToCity[cid];
      const size = companyToSize[cid];
      if (city) cityDealCounts[city] = (cityDealCounts[city] ?? 0) + 1;
      if (size != null) sizeDealCounts[size] = (sizeDealCounts[size] ?? 0) + 1;
    }

    const sortedCities = Object.keys(cityToIds).sort(
      (a, b) => (cityDealCounts[b] ?? 0) - (cityDealCounts[a] ?? 0)
    );

    const sortedSizes = [...sizes].sort(
      (a, b) => (sizeDealCounts[b.id] ?? 0) - (sizeDealCounts[a.id] ?? 0)
    );

    return { sortedCities, sortedSizes, cityToIds, sizeToIds };
  }, [companies, allDeals]);

  // Reset local state when an external action clears the filter (e.g. "Clear all")
  useEffect(() => {
    if (!filterValues[COMPANY_IN_FILTER]) {
      setSelectedCity("");
      setSelectedSize("");
    }
  }, [filterValues]);

  const applyFilter = (city: string, size: string) => {
    const current = filterValuesRef.current;
    let ids: string[] | null = null;

    if (city && size) {
      const citySet = new Set(cityToIds[city] ?? []);
      ids = (sizeToIds[Number(size)] ?? []).filter((id) => citySet.has(id));
    } else if (city) {
      ids = cityToIds[city] ?? [];
    } else if (size) {
      ids = sizeToIds[Number(size)] ?? [];
    }

    if (ids !== null) {
      setFilters(
        { ...current, [COMPANY_IN_FILTER]: buildInValue(ids) },
        displayedFilters
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [COMPANY_IN_FILTER]: _removed, ...rest } = current;
      setFilters(rest, displayedFilters);
    }
  };

  const handleCityChange = (city: string) => {
    const next = city === "__all__" ? "" : city;
    setSelectedCity(next);
    applyFilter(next, selectedSize);
  };

  const handleSizeChange = (size: string) => {
    const next = size === "__all__" ? "" : size;
    setSelectedSize(next);
    applyFilter(selectedCity, next);
  };

  return (
    <div className="flex items-center gap-3">
      {sortedCities.length > 0 && (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={selectedCity} onValueChange={handleCityChange}>
            <SelectTrigger className="h-8 text-sm w-36">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All cities</SelectItem>
              {sortedCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <Building className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={selectedSize} onValueChange={handleSizeChange}>
          <SelectTrigger className="h-8 text-sm w-44">
            <SelectValue placeholder="Company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All sizes</SelectItem>
            {sortedSizes.map((size) => (
              <SelectItem key={size.id} value={String(size.id)}>
                {size.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
