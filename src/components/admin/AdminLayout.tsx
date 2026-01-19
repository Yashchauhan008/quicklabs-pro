import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BreadcrumbNav } from './BreadcrumbNav';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-background p-4">
          <BreadcrumbNav />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};