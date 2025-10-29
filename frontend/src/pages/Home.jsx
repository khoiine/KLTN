import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import Blog from '../components/Blog'


const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller/>      
      <Blog/> 
      <OurPolicy />
      <NewsletterBox />
    </div>
  )
}

export default Home
