#!/bin/bash
# Script to convert all Supabase repository files to PostgreSQL
# This automates the conversion of multiple repository files

set -e

echo "=== Starting Repository Conversion to PostgreSQL ==="

# Function to convert a repository file
convert_file() {
  local file="$1"
  echo "Converting: $file"

  # Backup original
  cp "$file" "${file}.supabase_backup"

  # Replace Supabase imports with PostgreSQL query function
  sed -i 's/import { createClient, SupabaseClient } from "@supabase\/supabase-js";/import { query } from "@\/lib\/db";/g' "$file"
  sed -i 's/import { createClient } from "@supabase\/supabase-js";/import { query } from "@\/lib\/db";/g' "$file"
  sed -i 's/import { supabase } from "@\/lib\/supabase\/client";/import { query } from "@\/lib\/db";/g' "$file"
  sed -i 's/import { supabaseAdmin } from "@\/lib\/db";/import { query } from "@\/lib\/db";/g' "$file"

  echo "  ✓ Converted $file"
}

# List of files to convert
FILES=(
  "src/modules/insulin/infrastructure/adapters/InsulinRepo.supabase.ts"
  "src/modules/water/infrastructure/adapters/WaterRepo.supabase.ts"
  "src/modules/weight/infrastructure/adapters/WeightRepo.supabase.ts"
  "src/modules/bp/infrastructure/adapters/BPRepo.supabase.ts"
  "src/infra/repositories/SupabaseBloodGlucoseRepository.ts"
  "src/infra/repositories/SupabaseInsulinRepository.ts"
  "src/infra/repositories/SupabaseMealRepository.ts"
  "src/infra/repositories/SupabaseWaterRepository.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    convert_file "$file"
  else
    echo "  ⚠ File not found: $file"
  fi
done

echo "=== Repository Conversion Complete ==="
echo "Note: Manual review required for query conversion logic"
