alter table deals
  add column if not exists deal_type text
    check (deal_type in ('new_business', 'renewal', 'tos', 'toao'));
