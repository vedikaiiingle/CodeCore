import { useAuth } from '../contexts/AuthContext';

export default function UserMenu({ onClose }) {
  const { user, logout } = useAuth();

  return (
    <div className="absolute right-4 top-14 bg-white shadow-lg rounded-lg p-4 z-50 min-w-[220px]">
      <div className="mb-2">
        <div className="font-semibold">{user.username || user.name}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
      </div>
      <hr className="my-2" />
      <button
        className="w-full text-left py-2 px-2 hover:bg-gray-100 rounded"
        onClick={() => {
          window.location.href = '/profile';
          onClose();
        }}
      >
        My Account
      </button>
      <button
        className="w-full text-left py-2 px-2 hover:bg-gray-100 rounded text-red-600"
        onClick={() => {
          logout();
          onClose();
        }}
      >
        Logout
      </button>
    </div>
  );
} 