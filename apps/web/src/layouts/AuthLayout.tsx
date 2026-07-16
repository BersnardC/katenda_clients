import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-5">
        <Link to="/onboarding" className="flex items-center gap-2 w-fit">
          <div className="h-8 w-8 rounded-xl bg-brand grid place-items-center font-black text-brand-foreground">
            K
          </div>
          <span className="font-bold">Katenda</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-5 pb-10">
        <Outlet />
      </div>
    </div>
  );
}
