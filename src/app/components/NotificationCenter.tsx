import { useNotifications } from "@/app/context/NotificationContext";
import { Bell, X, AlertCircle, CheckCircle, Info, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function NotificationCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { notifications, markAsRead, clearAll, unreadCount } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-teal-500 to-emerald-600">
        <div className="flex items-center gap-2 text-white">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-white text-teal-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearAll}
            className="text-white/80 hover:text-white transition-colors p-1"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => markAsRead(n.id)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-teal-50/30' : ''}`}
              >
                {!n.isRead && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full" />
                )}
                <div className="flex gap-3">
                  <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    n.type === 'success' ? 'bg-green-100 text-green-600' :
                    n.type === 'error' ? 'bg-red-100 text-red-600' :
                    n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {n.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    {n.type === 'error' && <AlertCircle className="w-4 h-4" />}
                    {n.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                    {n.type === 'info' && <Info className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold text-gray-900 ${!n.isRead ? 'pr-4' : ''}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-50 text-center">
          <button 
            onClick={clearAll}
            className="text-xs text-teal-600 font-medium hover:text-teal-700 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
