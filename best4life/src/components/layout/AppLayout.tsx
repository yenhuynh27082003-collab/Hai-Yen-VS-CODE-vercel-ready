import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { MainNavbar } from '../ui/MainNavbar'
export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-white text-brand-900">
      <MainNavbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
