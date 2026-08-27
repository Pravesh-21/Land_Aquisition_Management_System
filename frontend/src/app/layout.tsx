import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";

export const metadata: Metadata = {
  title: "BHU-DRISHTI | National Land Acquisition & Management Engine",
  description: "Next-Gen Automated Land Acquisition Engine compliant with RFCTLARR Act (2013). Government of India - Ministry of Rural Development.",
  keywords: "land acquisition, RFCTLARR, BHU-DRISHTI, government portal, India, NHAI, PostGIS, ULPIN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <RoleProvider>
            {children}
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
