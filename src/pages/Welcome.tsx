
export default function Page() {
  return (
    <div className='flex justify-center' style={{ backgroundImage: 'url(https://raw.githubusercontent.com/Vedant-edu/Turf/main/images/topground.jpg)', backgroundSize: 'cover' }}>
      <div className='max-w-3xl mx-auto h-screen w-full'>
        <h1 className='text-[64px] p-4 mb-4 text-white font-mono bg-gradient-to-r from-transparent via-transparent to-transparent bg-opacity-50 backdrop-filter backdrop-blur-md'>Turfer</h1>
        <h1 className='text-[44px] p-4 mb-4 text-white font-mono'>
      Play Hard, <br /> Book Easy!"</h1>
        <div className='fixed bottom-20 left-0 right-0 mx-4 flex justify-center'>
          <button className='max-w-3xl mx-auto w-full py-6 bg-blue-700 hover:bg-black hover:text-white px-6  rounded-md'>
            <div className='text-center text-white font-mono'>Sign in</div>
          </button>
        </div>
      </div>
    </div>
  )
}
