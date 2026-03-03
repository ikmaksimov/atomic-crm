import { useState } from "react";
import { useGetIdentity, useListContext } from "ra-core";
import { LayoutGrid, List as ListIcon } from "lucide-react";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { InfiniteList } from "@/components/admin/infinite-list";
import { SortButton } from "@/components/admin/sort-button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { TopToolbar } from "../layout/TopToolbar";
import { CompanyEmpty } from "./CompanyEmpty";
import { CompanyListFilter } from "./CompanyListFilter";
import { CompanyDataTable } from "./CompanyDataTable";
import { ImageList } from "./GridList";

export const CompanyList = () => {
  const { identity } = useGetIdentity();
  const [viewMode, setViewMode] = useState<"grid" | "list">(() =>
    localStorage.getItem("company_view_mode") === "list" ? "list" : "grid"
  );

  const handleViewModeChange = (val: string) => {
    if (!val) return;
    setViewMode(val as "grid" | "list");
    localStorage.setItem("company_view_mode", val);
  };

  if (!identity) return null;
  return (
    <InfiniteList
      title={false}
      sort={{ field: "name", order: "ASC" }}
      actions={<CompanyListActions viewMode={viewMode} onViewModeChange={handleViewModeChange} />}
    >
      <CompanyListLayout viewMode={viewMode} />
    </InfiniteList>
  );
};

const CompanyListLayout = ({ viewMode }: { viewMode: "grid" | "list" }) => {
  const { data, isPending, filterValues } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters) return <CompanyEmpty />;

  return (
    <div className="w-full flex flex-row gap-8 items-start">
      <CompanyListFilter />
      <div className="flex flex-col flex-1 gap-4 min-w-0">
        {viewMode === "grid" ? <ImageList /> : <CompanyDataTable />}
      </div>
    </div>
  );
};

const CompanyListActions = ({
  viewMode,
  onViewModeChange
}: {
  viewMode: "grid" | "list";
  onViewModeChange: (val: string) => void;
}) => {
  return (
    <TopToolbar>
      <ToggleGroup type="single" value={viewMode} onValueChange={onViewModeChange} variant="outline" size="sm">
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view">
          <ListIcon className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <SortButton fields={["name", "created_at", "nb_contacts"]} />
      <ExportButton />
      <CreateButton label="New Company" />
    </TopToolbar>
  );
};
