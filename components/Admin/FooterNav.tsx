// components/Admin/FooterNav.tsx

export const FooterNav: React.FC = () => (
    <footer className="bg-white border-t border-charcoal-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Management Links */}
                <div className='hidden md:block'>
                    <h3 className="text-xs font-semibold text-charcoal-900 tracking-wider uppercase mb-2">Management</h3>
                    <ul className="space-y-1">
                        <li><a href="/admin/events" className="text-xs text-charcoal-600 hover:text-primary-600">Events & Tickets</a></li>
                        <li><a href="/admin/reservations" className="text-xs text-charcoal-600 hover:text-primary-600">Reservations</a></li>
                        <li><a href="/admin/payments" className="text-xs text-charcoal-600 hover:text-primary-600">Financials</a></li>
                    </ul>
                </div>
                {/* Quick Links */}
                <div>
                    <h3 className="text-xs font-semibold text-charcoal-900 tracking-wider uppercase mb-2">Quick Links</h3>
                    <ul className="space-y-1">
                        <li><a href="/admin/users" className="text-xs text-charcoal-600 hover:text-primary-600">My Profile</a></li>
                        <li><a href="/admin/analytics" className="text-xs text-charcoal-600 hover:text-primary-600">System Logs</a></li>
                        <li><a href="/admin/settings" className="text-xs text-charcoal-600 hover:text-primary-600">Settings</a></li>
                    </ul>
                </div>
                 {/* Branding / Copyright */}
                <div className='md:col-span-2 col-span-2 text-right'>
                    <div className="text-lg font-serif font-bold text-primary-600 mb-1">PPA Admin</div>
                    <p className="text-xs text-charcoal-500">
                        &copy; {new Date().getFullYear()} The Parliament of Plating & Pouring Affairs. 
                    </p>
                    <p className='text-xs text-charcoal-500'>Version 1.0 - Connected to Django API.</p>
                </div>
            </div>
        </div>
    </footer>
)