import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import {
  RoleForm,
  type RoleFormValue,
} from "@/components/roles/RoleForm";
import { RoleFormSkeleton } from "@/components/roles/RoleFormSkeleton";
import { roleService } from "@/services/roleService";
import { permissionService } from "@/services/permissionService";
import type { Role, Permission } from "@/types/models";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { uuid = "" } = useParams();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [form, setForm] = useState<RoleFormValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    roleService
      .show(uuid)
      .then((res) => {
        if (!alive) return;
        setRole(res.data);
        setForm({
          name: res.data.name,
          permission_ids: res.data.permissions.map((p) => p.id),
        });
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    permissionService
      .list()
      .then((res) => {
        if (alive) setPermissions(res.permissions);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [uuid]);

  if (loading) {
    return <RoleFormSkeleton />;
  }

  if (error || !role || !form) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t("roles.notFound")}</p>
        <Link to="/roles" className="text-primary font-medium">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      toast.error(t("roles.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      await roleService.update(role.uuid, {
        name: form.name.trim(),
        permission_ids: form.permission_ids,
      });
      toast.success(t("roles.updated"));
      navigate(`/roles/${role.uuid}`);
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("roles.updateError"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to={`/roles/${role.uuid}`}
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">
          {t("roles.edit")}
        </h1>
      </header>

      <form onSubmit={submit} className="px-5 mt-2 space-y-4">
        <RoleForm
          value={form}
          onChange={setForm}
          permissions={permissions}
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop cursor-pointer disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </form>
    </>
  );
}
