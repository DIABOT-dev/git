-- [Q1] enums.sex
do $$ begin
  create type sex as enum ('male','female','other');
exception when duplicate_object then null; end $$;

-- [Q2] enums.goal
do $$ begin
  create type goal as enum ('lose_weight','build_muscle','stabilize_glucose');
exception when duplicate_object then null; end $$;

-- [Q3] enums.glucose_tag
do $$ begin
  create type glucose_tag as enum ('fasting','before_meal','after_meal','bedtime','random');
exception when duplicate_object then null; end $$;

-- [Q4] enums.insulin_type
do $$ begin
  create type insulin_type as enum ('bolus','basal','mixed','correction');
exception when duplicate_object then null; end $$;

-- [Q5] enums.drink_kind
do $$ begin
  create type drink_kind as enum ('water','tea','coffee','milk','other');
exception when duplicate_object then null; end $$;
