-- Safe, idempotent indexes only. Already applied to production after the
-- disabled Rewards Shop foundation (18 November 2026).
create index if not exists vocabulary_reward_owned_reward_id_idx
  on public.vocabulary_reward_owned(reward_id);
create index if not exists vocabulary_reward_purchases_reward_id_idx
  on public.vocabulary_reward_purchases(reward_id);
