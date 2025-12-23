import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardList,
  ShoppingBag,
  BarChart3,
} from "lucide-react";

const items = [
  { to: "/dashboard", label: "대시보드", icon: LayoutGrid },
  { to: "/orders", label: "주문관리", icon: ClipboardList },
  { to: "/menu", label: "메뉴관리", icon: ShoppingBag },
  { to: "/analytics", label: "매출분석", icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <div className="mb-6">
        <h1 className="text-lg font-bold">Kiosk Admin</h1>
        <p className="text-sm text-gray-500">관리자 콘솔</p>
      </div>

      <nav className="space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                isActive
                  ? "bg-gray-100 font-semibold"
                  : "text-gray-600 hover:bg-gray-50",
              ].join(" ")
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
