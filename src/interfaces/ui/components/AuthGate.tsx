"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center animate-spin">
            <span className="text-2xl text-white">⚡</span>
          </div>
          <p className="text-muted-foreground">Checking session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Sign in required</h2>
          <Link href="/auth/login" className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-white">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}