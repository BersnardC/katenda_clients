import { useNavigate } from "react-router-dom";
import { Store, Plus, Trash2, Edit, ExternalLink } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@katenda_clients/ui";
import { useStores, useDeactivateStore } from "@/hooks/useStores";
import { useI18n } from "@/lib/i18n";
//import { cn } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useState } from "react";
import { Skeleton } from "@katenda_clients/ui";

export default function StoreList() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data: stores, isLoading } = useStores();
  const deactivateStore = useDeactivateStore();
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Tiendas" description="Gestiona tus tiendas y catálogos">
        <Button
          onClick={() => navigate("/stores/new")}
          className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("stores.add")}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !stores?.length ? (
        <EmptyState
          icon={<Store className="h-8 w-8" />}
          title="No tienes tiendas aún"
          description="Crea tu primera tienda para empezar a vender."
          action={
            <Button
              onClick={() => navigate("/stores/new")}
              className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" />
              Crear tienda
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card
              key={store.uuid}
              className="cursor-pointer transition-all hover:shadow-md hover:border-brand/30"
              onClick={() => navigate(`/stores/${store.uuid}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{store.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(`/s/${store.slug}`, "_blank"); }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Ver tienda pública"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/stores/${store.uuid}/edit`); }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteUuid(store.uuid); }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate">
                  {store.description || "Sin descripción"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  /{store.slug}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteUuid}
        onOpenChange={() => setDeleteUuid(null)}
        title="Desactivar tienda"
        description="¿Estás seguro? La tienda y sus productos dejarán de ser visibles. Puedes reactivarla después."
        confirmLabel="Desactivar"
        variant="destructive"
        onConfirm={() => {
          if (deleteUuid) deactivateStore.mutate(deleteUuid);
          setDeleteUuid(null);
        }}
      />
    </div>
  );
}
