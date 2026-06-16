"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    console.log("TOKEN IN LAYOUT:", token);

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
