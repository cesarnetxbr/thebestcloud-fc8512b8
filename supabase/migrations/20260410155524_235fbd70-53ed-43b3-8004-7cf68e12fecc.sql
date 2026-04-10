
-- Create mapping table between Acronis offering item names and our price table SKU codes
CREATE TABLE public.acronis_sku_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acronis_name TEXT NOT NULL UNIQUE,
  sku_code TEXT NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'count',
  description TEXT,
  is_billable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.acronis_sku_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view mappings"
  ON public.acronis_sku_mapping FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage mappings"
  ON public.acronis_sku_mapping FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Pre-populate with known mappings
-- Per-Gigabyte edition workloads
INSERT INTO public.acronis_sku_mapping (acronis_name, sku_code, unit_type, description, is_billable) VALUES
  ('pg_base_servers', 'SBDAMSENS', 'count', 'BDR - Servidor (3 TB) - G1', true),
  ('pg_base_vms', 'SBDBMSENS', 'count', 'BDR - VM (2 TB) - G1', true),
  ('pg_base_workstations', 'SBDCMSENS', 'count', 'BDR - Workstation (300 GB) - G1', true),
  ('pg_base_secondary_vms', 'SBDIMSENS', 'count', 'BDR - VM (2 TB) - G2', true),
  ('pg_base_secondary_workstations', 'SBDJMSENS', 'count', 'BDR - Workstation (300 GB) - G2', true),
  ('pg_base_storage', 'SCVAMSENS', 'bytes_to_gb', 'Storage por GB', true),
  ('pg_pack_adv_security', 'SESBMSENS', 'count', 'Pack Segurança Avançada', true),
  ('pg_pack_adv_management', 'SESDMSENS', 'count', 'Pack Gerenciamento Avançado', true),
  -- Per-Workload edition
  ('pw_base_vms', 'SBDBMSENS', 'count', 'BDR - VM (PW)', true),
  ('pw_base_storage', 'SCVAMSENS', 'bytes_to_gb', 'Storage por GB (PW)', true),
  ('pw_pack_adv_security', 'SESBMSENS', 'count', 'Pack Segurança Avançada (PW)', true),
  ('pw_pack_adv_management', 'SESDMSENS', 'count', 'Pack Gerenciamento Avançado (PW)', true),
  -- EDR / Security
  ('adv_security_edr_workloads', 'SESBMSENS', 'count', 'EDR Workloads', true),
  ('adv_security_without_edr', 'SESBMSENS', 'count', 'Segurança sem EDR', true),
  -- Aggregate/informational items - not billable
  ('total_storage', 'TOTAL_STORAGE', 'bytes_to_gb', 'Storage Total (informativo)', false),
  ('storage_total', 'STORAGE_TOTAL', 'bytes_to_gb', 'Storage Total (informativo)', false),
  ('total_protected_workloads', 'TOTAL_WL', 'count', 'Total Workloads (informativo)', false),
  ('immutable_storage', 'IMMUTABLE_STORAGE', 'bytes_to_gb', 'Storage Imutável', true),
  ('vm_storage', 'VM_STORAGE', 'bytes_to_gb', 'Storage VMs (informativo)', false),
  ('server_storage', 'SERVER_STORAGE', 'bytes_to_gb', 'Storage Servidores (informativo)', false),
  ('workstation_storage', 'WS_STORAGE', 'bytes_to_gb', 'Storage Workstations (informativo)', false);
