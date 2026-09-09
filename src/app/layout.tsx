import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TenantProvider } from "@/context/TenantContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateCompanyModal } from "@/components/modals/CreateCompanyModal";

export const metadata: Metadata = {
  title: "Cumplity AI - SaaS de SG-SST en Colombia",
  description:
    "Plataforma SaaS Multi-Tenant asistida por IA para consultores de SG-SST (Decreto 1072/2015 y Resolución 0312/2019).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#F8F9FB] text-carbon min-h-screen antialiased flex flex-col selection:bg-purple-100 selection:text-purple-700">
        <AuthProvider>
          <TenantProvider>
            <Navbar />
            <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
              <Sidebar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F8F9FB] overflow-y-auto max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
            <CreateCompanyModal />
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
