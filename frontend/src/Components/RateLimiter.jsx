import React from 'react'
import { Zap } from 'lucide-react'

const RateLimiter = () => {
    return (
        <>
            <section className='flex gap-5 items-center bg-[#44B854] w-7xl m-auto p-4'>
                <div>
                    <Zap />
                </div>
                <div className=' flex-col'>
                    <p>Your purchase has been confirmed!</p>
                    <p>Your purchase has been confirmed!</p>
                    <p>Your purchase has been confirmed!</p>
                </div>
            </section>
        </>
    )
}

export default RateLimiter