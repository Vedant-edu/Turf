import { SignInButton } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div className='flex justify-center max-w-8xl mx-auto' style={{ backgroundImage: 'url(https://img.freepik.com/free-photo/abstract-gradient-neon-lights_23-2149279092.jpg?ga=GA1.1.1761220439.1741347886&semt=ais_hybrid&w=740)', backgroundSize: 'cover' }}>
      <div className='max-w-8xl mx-auto h-screen w-full'>
        <div className='text-[64px] w-8xl p-4 mb-4 text-white font-mono bg-gradient-to-r from-transparent via-transparent to-transparent bg-opacity-50 backdrop-filter h-screen backdrop-blur-lg flex justify-center'>
          <div className='fixed bottom-4'>
            <div className='text-left '>
              <h1 className='text-7xl text-left'>Turfer</h1>
              <h1 className='text-[32px] mb-8 text-lefttext-white font-mono'>
                Book turfs easily
              </h1>
              <SignInButton>
                <button className='max-w-3xl mx-auto px-44 py-4 text-xl bg-blue-700 hover:bg-black hover:text-white backdrop-filter backdrop-blur-lg  rounded-md'>
                  <div className='text-center text-white font-mono'>Sign in</div>
                </button>
              </SignInButton>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
