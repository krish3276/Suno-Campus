import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <>
            <div className='container'>
                <ul className='flex justify-end gap-5 p-6'>
                    <div className='flex relative'>
                        <img src="/images/search.png" className='w-5 absolute m-2 md:m-2' />
                        <input type="seacrch" placeholder='Search' className='border border-black rounded-2xl pb-2 pl-8 pt-1 md:pl-8' />
                    </div>
                    <Link to="/">feed</Link>
                    <Link to="/profile"><img src="/images/profile.png" className='w-8' /></Link>
                </ul>
            </div>
        </>
    )
}

export default Navbar
