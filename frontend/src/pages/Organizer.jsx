import React from 'react'
import CategoryManager from '../components/CategoryManager'
import TagManager from '../components/TagManager'

const Organizer = () => {
  return (
    <div>
        <h2>
            Organizer
        </h2>
        <hr/>
        <div className='organizer'>
            <div className='organizer-section'>
               <CategoryManager /> 
            </div>
            <div className='organizer-section'>
                <TagManager />
            </div>
            
        </div>
    </div>
  )
}

export default Organizer