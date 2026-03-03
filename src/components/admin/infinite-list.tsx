import {
    FilterContext,
    InfiniteListBase,
    Translate,
    useGetResourceLabel,
    useHasDashboard,
    useResourceContext,
    useResourceDefinition,
    useTranslate,
} from "ra-core";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbPage,
} from "@/components/admin/breadcrumb";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { FilterButton, FilterForm } from "@/components/admin/filter-form";
import type { ListProps } from "@/components/admin/list";

export const InfiniteList = <RecordType extends { id: string | number }>({
    debounce,
    disableAuthentication,
    disableSyncWithLocation,
    exporter,
    filter,
    filterDefaultValues,
    storeKey,
    queryOptions,
    resource,
    sort,
    ...rest
}: ListProps<RecordType>) => {
    return (
        <InfiniteListBase<RecordType>
            debounce={debounce}
            disableAuthentication={disableAuthentication}
            disableSyncWithLocation={disableSyncWithLocation}
            exporter={exporter}
            filter={filter}
            filterDefaultValues={filterDefaultValues}
            queryOptions={queryOptions}
            resource={resource}
            sort={sort}
            storeKey={storeKey}
        >
            <InfiniteListView<RecordType> {...rest} pagination={null} />
        </InfiniteListBase>
    );
};

const InfiniteListView = <RecordType extends { id: string | number }>(
    props: any,
) => {
    const {
        disableBreadcrumb,
        filters,
        pagination,
        title,
        children,
        actions,
    } = props;
    const translate = useTranslate();
    const resource = useResourceContext();
    if (!resource) {
        throw new Error(
            "The InfiniteListView component must be used within a ResourceContextProvider",
        );
    }
    const getResourceLabel = useGetResourceLabel();
    const resourceLabel = getResourceLabel(resource, 2);
    const finalTitle =
        title !== undefined
            ? title
            : translate("ra.page.list", {
                name: resourceLabel,
            });
    const { hasCreate } = useResourceDefinition({ resource });
    const hasDashboard = useHasDashboard();

    return (
        <>
            {!disableBreadcrumb && (
                <Breadcrumb>
                    {hasDashboard && (
                        <BreadcrumbItem>
                            <Link to="/">
                                <Translate i18nKey="ra.page.dashboard">Home</Translate>
                            </Link>
                        </BreadcrumbItem>
                    )}
                    <BreadcrumbPage>{resourceLabel}</BreadcrumbPage>
                </Breadcrumb>
            )}

            <FilterContext.Provider value={filters}>
                <div className="flex justify-between items-start flex-wrap gap-2 my-2">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        {finalTitle}
                    </h2>
                    {actions ?? (
                        <div className="flex items-center gap-2">
                            {filters && filters.length > 0 ? <FilterButton /> : null}
                            {hasCreate ? <CreateButton /> : null}
                            {<ExportButton />}
                        </div>
                    )}
                </div>
                <FilterForm />

                <div className={cn("my-2", props.className)}>{children}</div>
                {pagination}
            </FilterContext.Provider>
        </>
    );
};
