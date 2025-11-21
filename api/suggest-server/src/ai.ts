type ColorSuggestion = {
  accents: string[]
  neutrals: string[]
  avoid: string[]
  combinations: { base: string; pair: string }[]
}

type OutfitRecommendation = {
  occasion: string
  sets: { title: string; items: string[]; estCost?: number }[]
}

type StyleAdvice = {
  matches: { productId?: string; name: string; advice: string[] }[]
}

function chooseAccents(palette: string[]) {
  const set = new Set(palette.map(p => p.toLowerCase()))
  const accents = ['gold', 'silver', 'emerald', 'ruby', 'sapphire']
  return accents.filter(a => !set.has(a)).slice(0, 3)
}

export async function suggestColors(palette: string[]): Promise<ColorSuggestion> {
  const accents = chooseAccents(palette)
  const neutrals = ['black', 'white', 'ivory', 'charcoal'].slice(0, 3)
  const avoid = palette.length > 0 ? [palette[0]] : []
  const combinations = palette.slice(0, 3).map(p => ({ base: p, pair: accents[0] || 'gold' }))
  return { accents, neutrals, avoid, combinations }
}

export async function recommendOutfit(occasion: string, palette: string[] = [], min?: number, max?: number): Promise<OutfitRecommendation> {
  const base = palette[0] || 'black'
  const sets = [
    { title: 'Core', items: [base + ' dress', 'neutral heels', 'structured bag'], estCost: max || undefined },
    { title: 'Casual', items: [base + ' top', 'high-rise jeans', 'loafers'] }
  ]
  return { occasion, sets }
}

export async function styleAdvice(products: { id?: string; name: string; price: number }[], palette: string[] = []): Promise<StyleAdvice> {
  const matches = products.map(p => ({ productId: p.id, name: p.name, advice: ["pair with " + (palette[0] || 'neutral'), 'balance silhouette', 'add accent belt'] }))
  return { matches }
}