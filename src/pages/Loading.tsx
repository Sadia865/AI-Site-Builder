import { Loader2Icon } from 'lucide-react'
import React, { useEffect } from 'react'

const Loading = () => {
  useEffect(() => {
    setTimeout(() => {
      window.location.href = '/'
    }, 6000)
  }, [])
  
  return (
    <div className='h-screen flex flex-col items-center justify-center bg-[#020617]'>
      <div className='flex flex-col items-center gap-4'>
        <Loader2Icon className='w-12 h-12 text-purple-500 animate-spin' />
      </div>
    </div>
  )
}

export default Loading