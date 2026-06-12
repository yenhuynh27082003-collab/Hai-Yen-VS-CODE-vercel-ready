import { Globe, Mail, MapPin, Phone, Send, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'

export const Footer = () => {
  return (
    <footer className="bg-brand-900 text-brand-50">
      <div className="container-shell py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-100/90">
              Best4Life is your AI-powered meal planning and grocery assistant built to reduce waste,
              improve nutrition, and optimise your weekly shopping decisions.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            <div>
              <h4 className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-white">Navigation</h4>
              <ul className="mt-4 space-y-2 text-sm text-brand-100/90">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-white">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm text-brand-100/90">
                <li><Link to="/login" className="hover:text-white">Customer Login</Link></li>
                <li><Link to="/signup" className="hover:text-white">Create Account</Link></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-white">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-brand-100/90">
              <li className="flex items-center gap-2"><MapPin size={15} /> Melbourne, Australia</li>
              <li className="flex items-center gap-2"><Phone size={15} /> +61 3 9000 1111</li>
              <li className="flex items-center gap-2"><Mail size={15} /> hello@best4life.ai</li>
            </ul>
            <div className="mt-5 flex items-center gap-3">
              {[Globe, Share2, Send, Mail].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label="social"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-brand-700 bg-brand-800 text-brand-100 transition hover:border-brand-500 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-800 pt-6 text-xs text-brand-200/80">
          © {new Date().getFullYear()} Best4Life. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
