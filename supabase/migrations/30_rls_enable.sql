-- [Q26] rls.enable_all
alter table public.profiles      enable row level security;
alter table public.glucose_logs  enable row level security;
alter table public.meal_logs     enable row level security;
alter table public.water_logs    enable row level security;
alter table public.insulin_logs  enable row level security;
alter table public.weight_logs   enable row level security;
alter table public.bp_logs       enable row level security;
alter table public.metrics_day   enable row level security;
alter table public.metrics_week  enable row level security;
