BEGIN;

-- View tuần
CREATE VIEW IF NOT EXISTS v_metrics_week AS
SELECT
  profile_id,
  date_trunc('week', ts)::date AS week_start,
  AVG(value) AS avg_bg,
  COUNT(*) AS logs_count
FROM bg_logs
GROUP BY profile_id, date_trunc('week', ts)::date;

-- View tháng
CREATE VIEW IF NOT EXISTS v_metrics_month AS
SELECT
  profile_id,
  date_trunc('month', ts)::date AS month_start,
  COUNT(*) AS logs_count
FROM bg_logs
GROUP BY profile_id, date_trunc('month', ts)::date;

COMMIT;
