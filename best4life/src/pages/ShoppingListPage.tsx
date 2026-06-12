import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { calculateStoreTotals, calculateTotalEstimatedPrice, findCheapestStore } from '../utils/shopping'
import { MealPlanPreferences, SavedMealPlan, SavedShoppingList, ShoppingItem, UserHistory, WeeklyMealPlan } from '../types'

type StoreOption = 'Aldi' | 'Woolworths' | 'Coles' | 'Cheapest combination'
type Suburb = 'Melbourne CBD' | 'Carlton' | 'Clayton' | 'Box Hill' | 'Springvale' | 'Richmond'
type Mode = 'editing' | 'saved'
type StoreName = 'Aldi' | 'Woolworths' | 'Coles'

type Props = {
  shoppingList: ShoppingItem[]
  weeklyMealPlan: WeeklyMealPlan
  mealPlanPreferences: MealPlanPreferences
  onUpdateShoppingList: (list: ShoppingItem[]) => void
  onSaveToHistory: (mealPlan: SavedMealPlan, list: SavedShoppingList) => Promise<{ success: boolean; message?: string }>
  selectedSupermarket: StoreOption
  cartTotal: number
  onSelectSupermarket: (store: StoreOption) => void
  onUpdateCartTotal: (total: number) => void
  history: UserHistory
}

const suburbs: Suburb[] = ['Melbourne CBD', 'Carlton', 'Clayton', 'Box Hill', 'Springvale', 'Richmond']
const nearbyStores: Record<Suburb, string[]> = {
  'Melbourne CBD': ['Aldi QV — 1.0 km away', 'Woolworths Melbourne Central — 0.8 km away', 'Coles Southern Cross — 1.4 km away'],
  Carlton: ['Aldi Carlton — 1.2 km away', 'Woolworths Lygon St — 1.1 km away', 'Coles Carlton — 1.6 km away'],
  Clayton: ['Aldi Clayton — 0.9 km away', 'Woolworths Clayton — 1.3 km away', 'Coles Clayton — 1.5 km away'],
  'Box Hill': ['Aldi Box Hill — 1.1 km away', 'Woolworths Box Hill — 0.9 km away', 'Coles Box Hill — 1.4 km away'],
  Springvale: ['Aldi Springvale — 1.3 km away', 'Woolworths Springvale — 1.0 km away', 'Coles Springvale — 1.8 km away'],
  Richmond: ['Aldi Richmond — 1.6 km away', 'Woolworths Richmond — 0.9 km away', 'Coles Richmond — 2.4 km away'],
}

const img = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'

export const ShoppingListPage = ({ shoppingList, weeklyMealPlan, mealPlanPreferences, onUpdateShoppingList, onSaveToHistory, selectedSupermarket, cartTotal, onSelectSupermarket, onUpdateCartTotal, history }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [suburb, setSuburb] = useState<Suburb>('Melbourne CBD')
  const [mode, setMode] = useState<Mode>('editing')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedList, setSavedList] = useState<SavedShoppingList | null>(null)

  const viewedSavedId = (location.state as { savedListId?: string } | null)?.savedListId
  const viewedSavedList = history.shoppingLists.find((s) => s.id === viewedSavedId) ?? null

  const getItemStorePrices = (item: ShoppingItem) => {
    const fallback = Number.isFinite(item.estimatedPrice) ? item.estimatedPrice : 0
    return {
      Aldi: Number.isFinite(item.supermarkets?.Aldi) ? item.supermarkets.Aldi : fallback,
      Woolworths: Number.isFinite(item.supermarkets?.Woolworths) ? item.supermarkets.Woolworths : fallback,
      Coles: Number.isFinite(item.supermarkets?.Coles) ? item.supermarkets.Coles : fallback,
    }
  }

  const totals = useMemo(() => calculateStoreTotals(shoppingList), [shoppingList])
  const [cheapestStore, cheapestTotal] = findCheapestStore(totals)
  const normalizedSelectedStore: StoreName = selectedSupermarket === 'Cheapest combination' ? cheapestStore : selectedSupermarket

  const getStoreStock = (item: ShoppingItem, store: StoreName) => {
    const stockByStore = (item as ShoppingItem & { stockByStore?: Partial<Record<StoreName, boolean>> }).stockByStore
    if (typeof stockByStore?.[store] === 'boolean') return stockByStore[store] as boolean
    const seed = `${item.id}-${store}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return item.inStock ? seed % 8 !== 0 : seed % 3 === 0
  }

  const selectedStoreTotal = useMemo(() => totals[normalizedSelectedStore], [totals, normalizedSelectedStore])
  const potentialSavings = Math.max(0, selectedStoreTotal - cheapestTotal)
  const outOfStock = shoppingList.filter((item) => !getStoreStock(item, normalizedSelectedStore))
  const selectedStoreOutOfStockCount = shoppingList.filter((item) => !getStoreStock(item, normalizedSelectedStore)).length
  const itemCount = shoppingList.reduce((sum, i) => sum + (Number.parseInt(i.quantity.replace(/\D/g, ''), 10) || 1), 0)
  const uniqueItems = shoppingList.length
  const effectiveTotal = cartTotal || selectedStoreTotal || calculateTotalEstimatedPrice(shoppingList)

  useEffect(() => {
    onUpdateCartTotal(selectedStoreTotal)
  }, [selectedStoreTotal, onUpdateCartTotal])

  useEffect(() => {
    const savedSuburb = viewedSavedList?.selectedSuburb
    if (!savedSuburb) return
    if (suburbs.includes(savedSuburb as Suburb)) {
      setSuburb(savedSuburb as Suburb)
    }
  }, [viewedSavedList])

  const selectedPrice = (item: ShoppingItem) => {
    const prices = getItemStorePrices(item)
    return normalizedSelectedStore === 'Aldi'
      ? prices.Aldi
      : normalizedSelectedStore === 'Woolworths'
        ? prices.Woolworths
        : normalizedSelectedStore === 'Coles'
          ? prices.Coles
          : Math.min(prices.Aldi, prices.Woolworths, prices.Coles)
  }

  const updateQty = (id: string, delta: number) => {
    const next = shoppingList.map((item) => {
      if (item.id !== id) return item
      const qty = Number.parseInt(item.quantity.replace(/\D/g, ''), 10) || 1
      const n = Math.max(1, qty + delta)
      const factor = n / qty
      const prices = getItemStorePrices(item)
      return {
        ...item,
        quantity: `${n}`,
        estimatedPrice: Number(((item.estimatedPrice ?? 0) * factor).toFixed(2)),
        supermarkets: {
          Aldi: Number((prices.Aldi * factor).toFixed(2)),
          Woolworths: Number((prices.Woolworths * factor).toFixed(2)),
          Coles: Number((prices.Coles * factor).toFixed(2)),
        },
      }
    })
    onUpdateShoppingList(next)
    onUpdateCartTotal(calculateTotalEstimatedPrice(next))
  }

  const save = async () => {
    const now = new Date().toISOString()
    const selectedTotal = totals[normalizedSelectedStore]

    const saved: SavedShoppingList = {
      id: `shop-${now}`,
      createdAt: now,
      items: shoppingList,
      totalEstimatedCost: Number(selectedTotal.toFixed(2)),
      selectedSupermarket: normalizedSelectedStore,
      selectedSuburb: suburb,
      itemCount,
    }

    setIsSaving(true)
    const result = await onSaveToHistory({ id: `meal-${now}`, createdAt: now, preferences: mealPlanPreferences, plan: weeklyMealPlan }, saved)
    setIsSaving(false)

    if (!result.success) {
      setMessage(result.message ?? 'We couldn’t save to backend. Your list is still available locally.')
      return
    }

    setSavedList(saved)
    setMode('saved')
    setMessage(result.message ?? 'Shopping list saved successfully')
  }

  const activeSaved = viewedSavedList ?? savedList

  if (shoppingList.length === 0 && !activeSaved) {
    return (
      <section className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-green-950">No shopping list yet.</p>
        <p className="mt-1 text-sm text-green-800">Create a meal plan first to generate your grocery list.</p>
        <button onClick={() => navigate('/create-meal-plan')} className="mt-4 rounded-xl bg-green-800 px-4 py-2 text-white">Create Meal Plan</button>
      </section>
    )
  }

  return mode === 'editing' ? (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-green-950">Choose your supermarket</h1>
          <p className="mt-1 text-sm text-green-800">Switch stores to instantly compare prices and stock for your grocery list.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <select value={normalizedSelectedStore} onChange={(e) => onSelectSupermarket(e.target.value as StoreOption)} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm"><option>Aldi</option><option>Woolworths</option><option>Coles</option></select>
            <select value={suburb} onChange={(e) => setSuburb(e.target.value as Suburb)} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm">{suburbs.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-green-900">{nearbyStores[suburb].map((s) => <p key={s} className="flex items-center gap-2"><MapPin className="size-3.5" />{s}</p>)}</div>
          <p className="mt-3 rounded-xl bg-emerald-50/70 px-3 py-2 text-xs text-green-800">Prices are estimated using Best4Life sample supermarket data for Aldi, Woolworths, and Coles. They are for planning and demonstration purposes.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shoppingList.map((item) => {
            const prices = getItemStorePrices(item)
            const selectedItemPrice = selectedPrice(item)
            const [lowestStore, lowestPrice] = ([
              ['Aldi', prices.Aldi],
              ['Woolworths', prices.Woolworths],
              ['Coles', prices.Coles],
            ] as [StoreName, number][]).sort((a, b) => a[1] - b[1])[0]
            const selectedStoreInStock = getStoreStock(item, normalizedSelectedStore)
            return (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <img src={img} alt={item.name} className="h-32 w-full object-cover" />
                <div className="p-3">
                  <p className="font-semibold text-green-950">{item.name}</p>
                  <p className="text-sm text-green-700">Qty needed: <span className="font-semibold">{item.quantity}</span></p>
                  <p className="text-lg font-bold text-green-900">Selected price at {normalizedSelectedStore}: ${selectedItemPrice.toFixed(2)}</p>
                  <p className="text-xs text-green-700">Aldi ${prices.Aldi.toFixed(2)} • Woolworths ${prices.Woolworths.toFixed(2)} • Coles ${prices.Coles.toFixed(2)}</p>
                  {lowestStore !== normalizedSelectedStore ? <p className="text-[11px] font-medium text-amber-700">Cheapest at {lowestStore} (${lowestPrice.toFixed(2)})</p> : <p className="text-[11px] font-medium text-green-700">Already lowest at {normalizedSelectedStore}</p>}
                  <p className={`text-[11px] ${selectedStoreInStock ? 'text-green-700' : 'text-red-600'}`}>{selectedStoreInStock ? 'In stock' : `Out of stock at ${normalizedSelectedStore}`}</p>
                  {!selectedStoreInStock ? <p className="text-[11px] text-emerald-700">Replacement suggestion: {item.alternative ?? 'Try a seasonal substitute'}</p> : null}
                  <p className="text-[11px] text-emerald-700">{item.smartNote ?? `Used in ${item.usedInMealsCount ?? 1} meals this week`}</p>
                  <div className="mt-2 flex items-center gap-2"><button className="rounded border px-2" onClick={() => updateQty(item.id, -1)}>-</button><span>{item.quantity}</span><button className="rounded border px-2" onClick={() => updateQty(item.id, 1)}>+</button></div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
      <aside className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm xl:sticky xl:top-24 xl:h-fit">
        <h2 className="text-lg font-semibold text-green-950">Cart summary</h2>
        <p className="text-sm text-green-900">Selected supermarket: <b>{normalizedSelectedStore}</b></p>
        <p className="text-sm text-green-900">Selected store total: <b>${effectiveTotal.toFixed(2)}</b></p>
        <p className="text-sm text-green-900">Cheapest store: <b>{cheapestStore}</b></p>
        <p className="text-sm text-green-900">Potential savings: <b>${potentialSavings.toFixed(2)}</b></p>
        <p className="text-sm text-green-900">Unique grocery items: <b>{uniqueItems}</b></p>
        <p className="text-sm text-green-900">Out-of-stock items: <b>{selectedStoreOutOfStockCount}</b></p>
        {normalizedSelectedStore !== cheapestStore ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">Switching to {cheapestStore} could save you approximately ${potentialSavings.toFixed(2)}.</p>
        ) : (
          <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-green-800">You are already shopping at the lowest estimated total.</p>
        )}
        {normalizedSelectedStore !== cheapestStore ? (
          <button onClick={() => onSelectSupermarket(cheapestStore)} className="mt-3 w-full rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-green-900 hover:bg-emerald-50">Switch to cheapest store</button>
        ) : null}
        <button disabled={isSaving} onClick={() => void save()} className="mt-4 w-full rounded-xl bg-green-800 px-4 py-2 text-white disabled:opacity-60">{isSaving ? 'Saving…' : 'Save Shopping List'}</button>
      </aside>
    </section>
  ) : (
    <section className="space-y-4">
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-green-950">{message || 'Shopping list saved successfully'}</h1>
        <p className="text-sm text-green-800">{activeSaved?.selectedSupermarket ?? selectedSupermarket} • {new Date((activeSaved?.createdAt ?? new Date().toISOString())).toLocaleString()}</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <p className="text-sm text-green-900">Total items: <b>{activeSaved?.itemCount ?? activeSaved?.items.length ?? 0}</b></p>
        <p className="text-sm text-green-900">Final total: <b>${(activeSaved?.totalEstimatedCost ?? effectiveTotal).toFixed(2)}</b></p>
        <p className="text-sm text-green-900">Estimated savings: <b>${Math.max(0, totals.Woolworths - cheapestTotal).toFixed(2)}</b></p>
        <p className="text-sm text-green-900">Out-of-stock replacements used: <b>{outOfStock.length}</b></p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm space-y-2">
        {(activeSaved?.items ?? []).map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-emerald-100 p-2">
            <img src={img} alt={item.name} className="h-12 w-12 rounded object-cover" />
            <div className="text-sm">
              <p className="font-semibold text-green-950">{item.name}</p>
              <p className="text-green-700">{item.quantity} • {activeSaved?.selectedSupermarket ?? selectedSupermarket} • ${item.estimatedPrice.toFixed(2)} • {item.inStock ? 'In stock' : 'Out of stock'}</p>
              <p className="text-[11px] text-emerald-700">{item.smartNote ?? `Used in ${item.usedInMealsCount ?? 1} meals this week`}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-xl border border-emerald-200 px-3 py-2 text-sm" onClick={() => setMode('saved')}>View Saved Shopping List</button>
        <button className="rounded-xl border border-emerald-200 px-3 py-2 text-sm" onClick={() => window.print()}>Print Shopping List</button>
        <button className="rounded-xl border border-emerald-200 px-3 py-2 text-sm" onClick={() => setMode('editing')}>Edit Shopping List</button>
        <button className="rounded-xl border border-emerald-200 px-3 py-2 text-sm" onClick={() => navigate('/profile/history')}>View History</button>
      </div>
    </section>
  )
}