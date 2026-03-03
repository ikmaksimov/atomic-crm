import { Building, MapPin, Truck, Users } from "lucide-react";
import { FilterLiveForm, useGetIdentity, useGetList } from "ra-core";
import { useState } from "react";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { SearchInput } from "@/components/admin/search-input";

import { FilterCategory } from "../filters/FilterCategory";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { sizes } from "./sizes";

const INITIAL_COUNT = 3;
const LOAD_MORE_COUNT = 5;

const ShowMoreButton = ({
  shown,
  total,
  onShowMore,
}: {
  shown: number;
  total: number;
  onShowMore: () => void;
}) => {
  if (shown >= total) return null;
  return (
    <button
      onClick={onShowMore}
      className="text-xs text-muted-foreground hover:text-foreground pl-4 mt-1 hover:underline underline-offset-2"
    >
      Show more ({total - shown})
    </button>
  );
};

export const CompanyListFilter = () => {
  const { identity } = useGetIdentity();
  const { companySectors } = useConfigurationContext();

  const [sizeCount, setSizeCount] = useState(INITIAL_COUNT);
  const [sectorCount, setSectorCount] = useState(INITIAL_COUNT);
  const [cityCount, setCityCount] = useState(INITIAL_COUNT);

  const { data: companies } = useGetList("companies", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "city", order: "ASC" },
  });

  // Sort cities by number of companies (descending)
  const cityCounts = (companies ?? []).reduce<Record<string, number>>(
    (acc, c) => {
      if (c.city) acc[c.city] = (acc[c.city] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const cities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([city]) => city);

  // Sort sectors by number of companies (descending)
  const sectorCounts = (companies ?? []).reduce<Record<string, number>>(
    (acc, c) => {
      if (c.sector) acc[c.sector] = (acc[c.sector] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const sortedSectors = [...companySectors].sort(
    (a, b) => (sectorCounts[b.value] ?? 0) - (sectorCounts[a.value] ?? 0)
  );

  // Sort sizes by number of companies (descending)
  const sizeCounts = (companies ?? []).reduce<Record<number, number>>(
    (acc, c) => {
      if (c.size != null) acc[c.size] = (acc[c.size] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const sortedSizes = [...sizes].sort(
    (a, b) => (sizeCounts[b.id] ?? 0) - (sizeCounts[a.id] ?? 0)
  );

  return (
    <div className="w-52 min-w-52 flex flex-col gap-8">
      <FilterLiveForm>
        <SearchInput source="q" />
      </FilterLiveForm>

      <FilterCategory icon={<Building className="h-4 w-4" />} label="Size">
        {sortedSizes.slice(0, sizeCount).map((size) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={size.name}
            key={size.name}
            value={{ size: size.id }}
          />
        ))}
        <ShowMoreButton
          shown={sizeCount}
          total={sortedSizes.length}
          onShowMore={() => setSizeCount((c) => c + LOAD_MORE_COUNT)}
        />
      </FilterCategory>

      <FilterCategory icon={<Truck className="h-4 w-4" />} label="Sector">
        {sortedSectors.slice(0, sectorCount).map((sector) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={sector.label}
            key={sector.value}
            value={{ sector: sector.value }}
          />
        ))}
        <ShowMoreButton
          shown={sectorCount}
          total={sortedSectors.length}
          onShowMore={() => setSectorCount((c) => c + LOAD_MORE_COUNT)}
        />
      </FilterCategory>

      {cities.length > 0 && (
        <FilterCategory icon={<MapPin className="h-4 w-4" />} label="City">
          {cities.slice(0, cityCount).map((city) => (
            <ToggleFilterButton
              className="w-full justify-between"
              label={city}
              key={city}
              value={{ city }}
            />
          ))}
          <ShowMoreButton
            shown={cityCount}
            total={cities.length}
            onShowMore={() => setCityCount((c) => c + LOAD_MORE_COUNT)}
          />
        </FilterCategory>
      )}

      <FilterCategory
        icon={<Users className="h-4 w-4" />}
        label="Account Manager"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={"Me"}
          value={{ sales_id: identity?.id }}
        />
      </FilterCategory>
    </div>
  );
};
