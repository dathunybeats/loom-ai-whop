-- Create trial subscription automatically for every new auth user (works for email & Google)
-- Safe to re-run: uses IF NOT EXISTS and ON CONFLICT

create or replace function public.create_trial_subscription()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Insert a trial row if one does not already exist for this user
  insert into public.user_subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    videos_limit,
    videos_used
  ) values (
    new.id,
    'trial',
    'trial',
    now(),
    '2099-12-31',
    5,
    0
  ) on conflict (user_id) do nothing;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_auto_trial_on_user_signup'
  ) then
    create trigger trg_auto_trial_on_user_signup
    after insert on auth.users
    for each row execute function public.create_trial_subscription();
  end if;
end $$;


