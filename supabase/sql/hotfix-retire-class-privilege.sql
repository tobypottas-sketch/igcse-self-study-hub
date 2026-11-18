-- Remove a legacy direct-RPC bypass for class retirement.
-- Only the service-role Edge Function may execute this privileged operation.
REVOKE ALL ON FUNCTION public.admin_retire_class(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_retire_class(uuid,uuid) TO service_role;