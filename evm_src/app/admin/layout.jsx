export default function AdminLayout({ children }) {
  return (
    <div className="admin-wrapper min-h-screen bg-gray-50">
      {/* Later, if you build a dedicated Admin Sidebar component, 
        you will put it right here so it stays on screen! 
      */}
      
      {/* This renders your page.jsx */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}