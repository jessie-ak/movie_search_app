import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
  return (
    <div className='search text-white text-3xl'>
      <div>
            <img src="search.svg" alt="search" />

            <input type='text' value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder='Search through thousands of movies'/>
        </div>
      
    </div>
  )
}

export default Search
