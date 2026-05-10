insert into storage.buckets (id, name, public) values ('proposals', 'proposals', false) on conflict (id) do nothing;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Service role manages proposals') then
    create policy "Service role manages proposals"
      on storage.objects for all
      to service_role using (bucket_id = 'proposals') with check (bucket_id = 'proposals');
  end if;
end $$;