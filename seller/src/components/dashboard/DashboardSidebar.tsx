import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Wrench, ShoppingCart, Star, User, X,
  Car
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Products", path: "/dashboard/products", icon: Package },
  { title: "Services", path: "/dashboard/services", icon: Wrench },
  { title: "Orders & Bookings", path: "/dashboard/orders", icon: ShoppingCart },
  { title: "Reviews", path: "/dashboard/reviews", icon: Star },
  { title: "Profile", path: "/dashboard/profile", icon: User },
];

interface Props {
  open: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ open, onToggle }: Props) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={onToggle} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full gradient-dark text-sidebar-foreground transition-all duration-300 flex flex-col
          ${open ? 'w-64' : 'w-0 lg:w-20'} 
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Car className="h-8 w-8 text-sidebar-primary shrink-0" />
          {open && (
            <span className="ml-3 font-display text-lg font-bold text-sidebar-accent-foreground truncate">
              AutoMarket
            </span>
          )}
          <button onClick={onToggle} className="ml-auto lg:hidden text-sidebar-muted hover:text-sidebar-accent-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'gradient-primary text-primary-foreground shadow-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {open && <span className="truncate">{item.title}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Seller type badge */}
        {open && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="bg-sidebar-accent rounded-lg p-3 text-xs">
              <span className="text-sidebar-muted">Seller Type</span>
              <p className="text-sidebar-accent-foreground font-semibold mt-0.5">Mechanic + Parts</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
