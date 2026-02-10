-- Revoke EXECUTE permission on simulate_price_update from public and anon roles
REVOKE EXECUTE ON FUNCTION public.simulate_price_update() FROM public;
REVOKE EXECUTE ON FUNCTION public.simulate_price_update() FROM anon;
REVOKE EXECUTE ON FUNCTION public.simulate_price_update() FROM authenticated;