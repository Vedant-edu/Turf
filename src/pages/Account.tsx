import { UserProfile, useUser, useClerk } from '@clerk/clerk-react';
import { ChevronRight, HelpCircle, Settings, Share2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import AppBarComponent from '../components/AppBar';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Account() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isTurfOwner, setIsTurfOwner] = useState(false);

  const userName = user?.fullName || 'Name';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'emailuse@gmail.com';
  const userImageUrl = user?.imageUrl;

  useEffect(() => {
    const checkTurfOwner = async () => {
      if (!userEmail) return;

      const { data, error } = await supabase
        .from('turf_data')
        .select('email')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Error fetching turf owner:', error);
      } else {
        setIsTurfOwner(!!data);
      }
    };

    checkTurfOwner();
  }, [userEmail]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome');
  };

  if (showUserProfile) {
    return (
      <div className='flex justify-center pt-10'>
        <UserProfile />
      </div>
    );
  }

  return (
    <>
      <AppBarComponent appbartitle="Account" />
      <div className="max-w-4xl mx-auto min-h-screen w-full">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              {userImageUrl && (
                <img src={userImageUrl} alt="Profile" className="w-16 h-16 rounded-full mr-4 object-cover" />
              )}
              <div>
                <h1 className="text-2xl font-bold">{userName}</h1>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-black hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              LOGOUT
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div onClick={() => setShowUserProfile(true)}>
            <AccountOption icon={<Settings className="w-6 h-6" />} text="Account Settings" />
          </div>
          <div onClick={() => {
            const shareUrl = 'https://turfer.netlify.app';
            const shareMessage = 'Join Turfer and find your perfect turf!';
            navigator.clipboard.writeText(shareUrl).then(() => {
              alert(`URL copied to clipboard: ${shareUrl}\nShare this with your friends: ${shareMessage}`);
            });
          }}>
            <AccountOption icon={<Share2 className="w-6 h-6" />} text="Refer & Earn" />
          </div>

          {userEmail === 'v7374757677@gmail.com' && (
            <div className='bg-red-300' onClick={() => navigate('/admin')}>
              <AccountOption icon={<HelpCircle className="w-6 h-6" />} text="Admin" />
            </div>
          )}

          {isTurfOwner && (
            <div className='bg-sky-300' onClick={() => navigate('/turfowner', { state: { email: userEmail } })}>
              <AccountOption icon={<Edit2 className="w-6 h-6" />} text="My Turf Access" />
            </div>
          )}
        </div>
        <BottomBar />
      </div>
    </>
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
