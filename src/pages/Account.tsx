import { UserProfile, useUser, useClerk } from '@clerk/clerk-react';
import { ChevronRight, CreditCard, HelpCircle, Settings, Share2, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BottomBar from '../components/BottomBar';

export default function Account() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // Get user details from Clerk
  const userName = user?.fullName || 'Name';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'emailuse@gmail.com';
  const userPhone = user?.phoneNumbers?.[0]?.phoneNumber || '9454661666'; // Get phone number if available
  const userImageUrl = user?.imageUrl;

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome');
  };

  if (showUserProfile) {
    return <UserProfile />;
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen w-full ">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            {userImageUrl && (
              <img 
                src={userImageUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full mr-4 object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{userName}</h1>
              <p className="text-sm text-gray-600">{userPhone}  •  {userEmail}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="bg-black hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            LOGOUT
          </button>
        </div>
        <div className="bg-emerald-900 text-white p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <div className="font-bold text-xs bg-white text-black p-2 rounded-sm">PLAY CLUB</div>
            <div className="text-sm align-center">Membership valid for: 116 days</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <div onClick={() => setShowUserProfile(true)}>
          <AccountOption icon={<Settings className="w-6 h-6" />} text="Settings & Personalization" />
        </div>
        <AccountOption icon={<Share2 className="w-6 h-6" />} text="Refer & Earn" />
        <AccountOption icon={<Coins className="w-6 h-6" />} text="Credits: ₹0" />
        <AccountOption icon={<CreditCard className="w-6 h-6" />} text="Saved Payment Methods" />
        <AccountOption icon={<HelpCircle className="w-6 h-6" />} text="Help & Support" />
      </div>
      <BottomBar/>
    </div>
  );
}

interface AccountOptionProps {
  icon: JSX.Element;
  text: string;
}

function AccountOption({ icon, text }: AccountOptionProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 cursor-pointer">
      <div className="flex items-center space-x-4">
        {icon}
        <span>{text}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
}