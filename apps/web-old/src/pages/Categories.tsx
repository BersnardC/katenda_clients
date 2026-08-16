import { Tags, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@katenda_clients/ui";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useState } from "react";

export default function Categories() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  const deleteCat = useDeleteCategory();
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Categorías" description="Organiza tus productos por categorías">
        <Button
          onClick={() => navigate("/categories/new")}
          className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nueva categoría
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !categories?.length ? (
        <EmptyState
          icon={<Tags className="h-8 w-8" />}
          title="No hay categorías"
          description="Crea categorías para organizar mejor tus productos."
          action={
            <Button onClick={() => navigate("/categories/new")} className="bg-accent text-accent-foreground hover:opacity-90 cursor-pointer">
              <Plus className="h-4 w-4 mr-1" />
              Crear categoría
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.uuid} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle
                    className="text-base flex items-center gap-2 cursor-pointer hover:text-brand"
                    onClick={() => navigate(`/categories/${cat.uuid}/edit`)}
                  >
                    {cat.icon || <Tags className="h-4 w-4 text-muted-foreground" />}
                    {cat.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/categories/${cat.uuid}/edit`)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteUuid(cat.uuid)}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">/{cat.slug}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteUuid}
        onOpenChange={() => setDeleteUuid(null)}
        title="Eliminar categoría"
        description="¿Estás seguro? Los productos asignados a esta categoría quedarán sin categoría."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => { if (deleteUuid) deleteCat.mutate(deleteUuid); setDeleteUuid(null); }}
      />
    </div>
  );
}
