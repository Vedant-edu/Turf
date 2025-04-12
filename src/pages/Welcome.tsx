import { SignInButton } from '@clerk/clerk-react';

export default function Page() {
  return (
    <>
      <div className='h-[70vh] mx-auto' style={{ backgroundImage: 'url(https://github.com/Vedant-edu/Turf/blob/main/images/image.png?raw=true)', backgroundSize: 'cover', backgroundPosition: 'center' }}>

      </div>
      <div className=' h-[30vh] p-4'>
      <h1 className='text-5xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl'>Turfer</h1>
      <p className='text-lg mb-8'>Book your turf easily.</p>
        <div className=' absolute bottom-4'>
          -
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
