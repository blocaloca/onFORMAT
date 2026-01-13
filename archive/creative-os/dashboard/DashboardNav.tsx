import Link from 'next/link';
import { GlassButton } from '@/components/ui/GlassButton';

interface DashboardNavProps {
    user: any;
    onLogout: () => void;
}

export const DashboardNav = ({ user, onLogout }: DashboardNavProps) => {
    return (
        <nav className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-6">
                <Link href="/dashboard" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Creative OS
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                {user?.email === 'casteelio@gmail.com' && (
                    <GlassButton
                        variant="ghost"
                        size="sm"
                        className="text-purple-400 hover:text-purple-300"
                    >
                        <Link href="/admin/dev-center" className="flex items-center gap-1">
                            🛠️ Dev Center
                        </Link>
                    </GlassButton>
                )}
                <span className="text-gray-400 text-sm">{user?.email}</span>
                <button
                    onClick={onLogout}
                    className="text-gray-400 hover:text-white transition text-sm font-medium"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};
