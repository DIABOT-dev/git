import { NextResponse } from "next/server";
import { getFeatureFlagStatus } from '../../../../../config/feature-flags';

interface QAItem {
  id: string;
  title: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIP";
  details: string;
}

interface QAResponse {
  meta: {
    id: string;
    version: string;
    commit: string;
    branch: string;
    startedAt: string;
    finishedAt: string;
  };
  stats: {
    total: number;
    passed: number;
    failed: number;
    warned: number;
  };
  items: QAItem[];
  featureFlags?: {
    clientSide: Record<string, any>;
    serverSide: Record<string, any>;
    killSwitch: boolean;
  };
}

async function checkEnvVars(): Promise<QAItem> {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  return {
    id: "env_vars",
    title: "Environment Variables Check",
    status: missing.length === 0 ? "PASS" : "FAIL",
    details: missing.length === 0 
      ? "All required environment variables present"
      : `Missing: ${missing.join(", ")}`
  };
}

async function checkSupabaseConnection(): Promise<QAItem> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !anonKey) {
      return {
        id: "supabase_connection",
        title: "Supabase Connection Test",
        status: "FAIL",
        details: "Missing Supabase credentials"
      };
    }

    // Ping Supabase auth settings endpoint
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: "supabase_connection",
      title: "Supabase Connection Test",
      status: response.ok ? "PASS" : "FAIL",
      details: response.ok 
        ? `Connected successfully (HTTP ${response.status})`
        : `Connection failed (HTTP ${response.status})`
    };
  } catch (error: any) {
    return {
      id: "supabase_connection",
      title: "Supabase Connection Test",
      status: "FAIL",
      details: `Connection error: ${error.message || 'Unknown error'}`
    };
  }
}

async function checkAPIHealth(): Promise<QAItem> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/ai/gateway`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    return {
      id: "api_health",
      title: "AI Gateway Health Check",
      status: response.ok && data.ok ? "PASS" : "FAIL",
      details: response.ok 
        ? `Gateway healthy (HTTP ${response.status})`
        : `Gateway unhealthy (HTTP ${response.status})`
    };
  } catch (error: any) {
    return {
      id: "api_health",
      title: "AI Gateway Health Check",
      status: "FAIL",
      details: `Health check failed: ${error.message || 'Unknown error'}`
    };
  }
}

export async function GET(): Promise<NextResponse<QAResponse>> {
  const startedAt = new Date().toISOString();

  // Run all checks
  const items = await Promise.all([
    checkEnvVars(),
    checkSupabaseConnection(),
    checkAPIHealth()
  ]);

  const finishedAt = new Date().toISOString();

  // Calculate stats
  const stats = {
    total: items.length,
    passed: items.filter(item => item.status === "PASS").length,
    failed: items.filter(item => item.status === "FAIL").length,
    warned: items.filter(item => item.status === "WARN").length
  };

  // Get feature flags status
  const featureFlags = getFeatureFlagStatus();

  const response: QAResponse = {
    meta: {
      id: crypto.randomUUID(),
      version: process.env.npm_package_version || "0.9.0",
      commit: process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
      branch: process.env.VERCEL_GIT_COMMIT_REF || "local",
      startedAt,
      finishedAt
    },
    stats,
    items,
    featureFlags
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}