import { SelectField } from "@/components/admin/select-field";
import { DataTable } from "@/components/admin/data-table";

import { useConfigurationContext } from "../root/ConfigurationContext";
import { CompanyAvatar } from "./CompanyAvatar";
import { sizes } from "./sizes";
import { InfiniteScrollDetector } from "./InfiniteScrollDetector";

export const CompanyDataTable = () => {
    const { companySectors } = useConfigurationContext();

    return (
        <>
            <DataTable>
                <DataTable.Col
                    label="Name"
                    source="name"
                    render={(record: any) => (
                        <div className="flex items-center gap-3">
                            <CompanyAvatar record={record} />
                            <span className="font-medium text-sm">{record.name}</span>
                        </div>
                    )}
                />
                <DataTable.Col
                    label="Sector"
                    source="sector"
                    render={(record: any) => {
                        const sectorLabel = companySectors.find(
                            (s) => s.value === record.sector,
                        )?.label;
                        return <span className="text-sm">{sectorLabel}</span>;
                    }}
                />
                <DataTable.Col label="Size" source="size">
                    <SelectField source="size" choices={sizes} />
                </DataTable.Col>
                <DataTable.Col label="City" source="city" />
                <DataTable.NumberCol
                    label="Revenue"
                    source="revenue"
                    options={{
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                    }}
                />
            </DataTable>
            <InfiniteScrollDetector />
        </>
    );
};
