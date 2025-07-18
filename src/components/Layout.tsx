import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Upload, 
  Calendar, 
  ClipboardList, 
  Settings,
  Truck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/import', label: 'Importação', icon: Upload },
    { path: '/daily-schedule', label: 'Programação Diária', icon: Calendar },
    { path: '/daily-status', label: 'Status Diário', icon: ClipboardList },
    { path: '/registers', label: 'Cadastros', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Truck className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-white">
            Sistema de Gestão de Frotas
          </h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gray-900">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="text-center text-gray-400">
          Desenvolvido por Carlos Freitas • © 2025
        </div>
      </footer>
    </div>
  );
};

export default Layout;