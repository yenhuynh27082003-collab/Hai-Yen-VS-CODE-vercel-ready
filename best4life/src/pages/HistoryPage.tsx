import { useNavigate } from 'react-router-dom'
import { UserHistory } from '../types'

type Props = { history: UserHistory }

export const HistoryPage = ({ history }: Props) => {
  const navigate = useNavigate()
  return (
    <section className="space-y-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-green-900">History</h1>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-green-900">Meal plans: <b>{history.mealPlans.length}</b></div>
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-green-900">Shopping lists: <b>{history.shoppingLists.length}</b></div>
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Recipes saved: <b>{history.savedRecipes?.length ?? 0}</b></div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-green-900">Past meal plans</h2>
          {history.mealPlans.map((plan) => <p key={plan.id} className="text-sm text-green-800">{new Date(plan.createdAt).toLocaleString()} • {plan.plan.days.length} days</p>)}
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-green-900">Past shopping lists</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {history.shoppingLists.map((list) => (
              <button key={list.id} className="rounded-xl border border-emerald-100 bg-white p-3 text-left text-sm text-green-900 hover:bg-emerald-50">
                <p>{new Date(list.createdAt).toLocaleString()}</p>
                <p>Store: <b>{list.selectedSupermarket ?? 'Cheapest combination'}</b></p>
                <p>Items: <b>{list.itemCount ?? list.items.length}</b></p>
                <p>Total: <b>${list.totalEstimatedCost.toFixed(2)}</b></p>
                <div className="mt-2 flex gap-2">
                  <button className="rounded-lg border border-emerald-200 px-2 py-1 text-xs" onClick={() => navigate('/shopping-list', { state: { savedListId: list.id } })}>View Shopping List</button>
                  <button className="rounded-lg border border-emerald-200 px-2 py-1 text-xs" onClick={() => window.print()}>Print</button>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
