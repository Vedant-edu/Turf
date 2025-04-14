import { SignInButton } from '@clerk/clerk-react';

export default function Page() {
  return (
    <>
      <div className='h-screen mx-auto' style={{ backgroundImage: 'url(https://github.com/Vedant-edu/Turf/blob/main/images/image.png?raw=true)', backgroundSize: 'cover', backgroundPosition: 'cover' }}>
          <div className='px-4 py-12 bg-gradient-to-t from-black to-transparent absolute bottom-0 via-black'>
            <div className='text-white'>
              <h1 className='text-6xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl pt-4 px-4'>Turfer</h1>
              <p className='text-sm pb-8 px-4'>Book your turf easily.</p>
            </div>
            <SignInButton>
              <button className='w-full bg-sky-300 p-4  rounded-md' style={{ width: 'calc(100vw - 32px)' }}>
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>


    </>
  );
}
