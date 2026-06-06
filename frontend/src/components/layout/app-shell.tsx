"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  Gauge,
  LogOut,
  Menu,
  PackageSearch,
  Shield,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logout } from "@/features/auth/api";
import { useSession } from "@/features/auth/use-session";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/products", label: "Produtos", icon: PackageSearch },
  { href: "/alerts", label: "Alertas", icon: Bell },
] as const;

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Produtos",
  new: "Novo produto",
  edit: "Editar",
  alerts: "Alertas",
  admin: "Administração",
  demo: "Demonstração",
};

function initials(name?: string) {
  return (
    name
      ?.split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "PC"
  );
}

export function Navigation({
  pathname,
  isAdmin,
}: {
  pathname: string;
  isAdmin: boolean;
}) {
  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin/demo"
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
            pathname.startsWith("/admin")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Shield className="size-4" aria-hidden="true" />
          Demonstração
        </Link>
      )}
    </nav>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground flex items-center gap-1 text-xs"
    >
      <Link href="/dashboard" className="hover:text-foreground">
        Início
      </Link>
      {parts.map((part, index) => (
        <span className="flex items-center gap-1" key={`${part}-${index}`}>
          <ChevronRight className="size-3" />
          <span className="max-w-36 truncate">
            {routeLabels[part] ??
              (index === parts.length - 1 ? "Detalhes" : part)}
          </span>
        </span>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });

  if (session.isLoading) {
    return (
      <main id="conteudo-principal" className="mx-auto max-w-7xl p-6">
        <PageSkeleton />
      </main>
    );
  }
  if (!session.data) {
    return (
      <main
        id="conteudo-principal"
        className="grid min-h-dvh place-items-center p-6"
      >
        <div className="text-center">
          <h1 className="text-xl font-bold">Sua sessão expirou</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Entre novamente para continuar.
          </p>
          <Button className="mt-5" onClick={() => router.replace("/login")}>
            Ir para o login
          </Button>
        </div>
      </main>
    );
  }

  const user = session.data;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      <aside className="bg-card sticky top-0 hidden h-dvh border-r p-5 md:flex md:flex-col">
        <Brand />
        <div className="mt-9 flex-1">
          <Navigation pathname={pathname} isAdmin={isAdmin} />
        </div>
        <div className="bg-muted/60 rounded-xl border p-3">
          <p className="text-xs font-semibold">Dupla verificação ativa</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Alertas só aparecem após aprovação do backend.
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="bg-background/92 sticky top-0 z-30 flex h-16 items-center border-b px-4 backdrop-blur sm:px-6">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 md:hidden"
                />
              }
            >
              <Menu />
              <span className="sr-only">Abrir navegação</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-5">
              <SheetHeader className="p-0">
                <SheetTitle className="sr-only">Navegação</SheetTitle>
                <Brand />
              </SheetHeader>
              <div className="mt-8">
                <Navigation pathname={pathname} isAdmin={isAdmin} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">
            <Breadcrumbs pathname={pathname} />
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="ml-1 h-10 gap-2 px-2" />
              }
            >
              <Avatar className="size-8">
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block max-w-32 truncate text-xs font-semibold">
                  {user.name}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <span className="block truncate">{user.name}</span>
                  <span className="text-muted-foreground block truncate text-xs font-normal">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserRound />
                Conta
                <Badge variant="outline" className="ml-auto">
                  {user.role}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main
          id="conteudo-principal"
          className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
