import { DataTable } from "@/src/components/table/data-table";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { NewAlertButton } from "@/src/features/alerts/components/NewAlertButton";
import { api } from "@/src/utils/api";
import { type RouterOutput } from "@/src/utils/types";

type RowData = {
  key: {
    id: string;
    name: string;
  };
  trigger: string;
  webhook: string;
};

export function AlertsTable(props: { projectId: string }) {
  const alerts = api.alerts.all.useQuery({
    projectId: props.projectId,
  });

  const columns: LangfuseColumnDef<RowData>[] = [
    {
      accessorKey: "key",
      header: "Name",
      cell: ({ row }) => {
        const key: RowData["key"] = row.getValue("key");
        return key.name;
      },
    },
    {
      accessorKey: "trigger",
      header: "Alert triggers when",
    },
    {
      accessorKey: "webhook",
      header: "Webhook URL",
    },
  ];

  const convertToTableRow = (
    item: RouterOutput["alerts"]["all"][number],
  ): RowData => {
    return {
      key: { id: item.id, name: item.name },
      trigger: `When ${item.alertMetric} exceeds ${item.alertThreshold}`,
      webhook: item.triggerWebhookUrl ?? "",
    };
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={
          alerts.isLoading
            ? { isLoading: true, isError: false }
            : alerts.isError
              ? {
                  isLoading: false,
                  isError: true,
                  error: alerts.error.message,
                }
              : {
                  isLoading: false,
                  isError: false,
                  data: alerts.data.map((t) => convertToTableRow(t)),
                }
        }
      />
      <NewAlertButton projectId={props.projectId} className="mt-4" />
    </div>
  );
}
