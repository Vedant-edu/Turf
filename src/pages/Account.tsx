import { UserProfile } from '@clerk/clerk-react';
import { ChevronRight, CreditCard, HelpCircle, Settings, Share2, Coins } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Account() {
  return (
    <div className="max-w-4xl mx-auto min-h-screen w-full ">
      <UserProfile/>
      {/* <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Name</h1>
            <p className="text-sm text-gray-600">9454661666  •  emailuse@gmail.com</p>
          </div>
          <Link to="/welcome" className="bg-black hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium">
           LOGOUT
          </Link>
        </div>
        <div className="bg-emerald-900 text-white p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <div className="font-bold text-xs bg-white text-black p-2 rounded-sm">PLAY CLUB</div>
            <div className="text-sm align-center">Membership valid for: 116 days</div>
          </div>
          
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <AccountOption icon={<Settings className="w-6 h-6" />} text="Settings & Personalization" />
        <AccountOption icon={<Share2 className="w-6 h-6" />} text="Refer & Earn" />
        <AccountOption icon={<Coins className="w-6 h-6" />} text="Credits: ₹0" />
        <AccountOption icon={<CreditCard className="w-6 h-6" />} text="Saved Payment Methods" />
        <AccountOption icon={<HelpCircle className="w-6 h-6" />} text="Help & Support" />
      </div> */}
    </div>
  )
}

function AccountOption({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <div className="flex items-center space-x-4">
        {icon}
        <span>{text}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  )
}