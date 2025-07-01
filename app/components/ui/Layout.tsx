import { cn } from '@/lib/utils'
import { Archive, LayoutGrid, MoonStar, Package, Plus, Settings, Sun, Tag } from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './button'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <Link to={to} className="w-full">
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn('w-full justify-start mb-1', isActive ? 'bg-secondary/50' : '')}
    >
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
)

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check if dark mode is enabled in localStorage or if user prefers dark mode
    return document.documentElement.classList.contains('dark')
  })

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
    setIsDarkMode(!isDarkMode)
  }

  const navItems = [
    { to: '/', icon: <LayoutGrid size={18} />, label: 'Dashboard' },
    { to: '/products', icon: <Package size={18} />, label: 'Products' },
    { to: '/categories', icon: <Tag size={18} />, label: 'Categories' },
    { to: '/storage', icon: <Archive size={18} />, label: 'Storage' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
  ]

  return (
    <div className="flex h-full bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Inventoria</h1>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)}
              />
            ))}
          </div>
        </div>

        {/* Add Product Button */}
        <div className="p-4 border-t border-border">
          <Link to="/products/new">
            <Button className="w-full">
              <Plus size={16} />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>

        {/* Dark Mode Toggle */}
        <div className="p-4 pt-0">
          <Button variant="outline" className="w-full" onClick={toggleDarkMode}>
            {isDarkMode ? (
              <>
                <Sun size={16} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <MoonStar size={16} />
                <span>Dark Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </div>
    </div>
  )
}
