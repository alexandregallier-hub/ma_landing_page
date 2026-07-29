import { createClient } from '@/lib/supabase/server'
import { DEFAULT_TOKENS, resolveTokens } from './defaults'
import type { BrandTokens } from './tokens'

export interface ActiveBrand {
  id: string | null
  name: string
  tokens: BrandTokens
  logoUrl: string | null
}

const FALLBACK: ActiveBrand = {
  id: null,
  name: 'Charte maison',
  tokens: DEFAULT_TOKENS,
  logoUrl: null,
}

/**
 * Charge la charte à appliquer, dans cet ordre de priorité :
 *   1. `brandId` explicite — utilisé par la session en cours et par
 *      l'aperçu `?brand=<id>` (montrer le rendu à un prospect avant la séance) ;
 *   2. la charte par défaut de l'organisation ;
 *   3. la charte maison codée dans defaults.ts.
 *
 * Ne lève jamais : une charte introuvable ne doit pas empêcher d'animer.
 */
export async function loadActiveBrand(brandId?: string | null): Promise<ActiveBrand> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('brand_profiles')
      .select('id, name, tokens, logo_path')
      .limit(1)

    query = brandId ? query.eq('id', brandId) : query.eq('is_default', true)

    const { data, error } = await query.maybeSingle()
    if (error || !data) return FALLBACK

    let logoUrl: string | null = null
    if (data.logo_path) {
      const { data: pub } = supabase.storage.from('branding').getPublicUrl(data.logo_path)
      logoUrl = pub?.publicUrl ?? null
    }

    return {
      id: data.id,
      name: data.name,
      tokens: resolveTokens(data.tokens),
      logoUrl,
    }
  } catch {
    return FALLBACK
  }
}
