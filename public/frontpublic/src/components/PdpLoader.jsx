import React from "react"
import ContentLoader from "react-content-loader"

const ShoppingLoader = props => {
  return (
    <ContentLoader
      speed={2}
      width="100%"
      height="100%"
      viewBox="0 0 1400 900"
      backgroundColor="#f9f4f9"
      foregroundColor="#ecebeb"
      {...props}
    >
      {/* Main Image */}
      <rect x="5%" y="20" rx="0" ry="0" width="40%" height="550" /> 
      {/* Gallery Thumbnails */}
      <rect x="5%" y="580" rx="0" ry="0" width="9%" height="100" /> 
      <rect x="15%" y="580" rx="0" ry="0" width="9%" height="100" /> 
      <rect x="25%" y="580" rx="0" ry="0" width="9%" height="100" /> 
      <rect x="35%" y="580" rx="0" ry="0" width="9%" height="100" /> 
      
      {/* Product Details */}
      <rect x="50%" y="40" rx="4" ry="4" width="40%" height="40" /> 
      <rect x="50%" y="100" rx="4" ry="4" width="30%" height="30" /> 
      <rect x="50%" y="150" rx="4" ry="4" width="20%" height="30" /> 
      <rect x="50%" y="200" rx="4" ry="4" width="50%" height="2" /> 
      <rect x="50%" y="220" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="56%" y="220" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="62%" y="220" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="50%" y="270" rx="4" ry="4" width="65%" height="2" /> 
      <rect x="50%" y="290" rx="4" ry="4" width="80%" height="2" /> 
      <rect x="50%" y="320" rx="4" ry="4" width="40%" height="30" /> 
      <rect x="50%" y="370" rx="4" ry="4" width="40%" height="30" /> 
      <rect x="50%" y="420" rx="4" ry="4" width="12%" height="30" /> 
      <rect x="63%" y="420" rx="4" ry="4" width="12%" height="30" /> 
      <rect x="50%" y="470" rx="4" ry="4" width="12%" height="30" /> 
      <rect x="63%" y="470" rx="4" ry="4" width="12%" height="30" /> 
      <rect x="50%" y="520" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="56%" y="520" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="62%" y="520" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="50%" y="570" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="56%" y="570" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="62%" y="570" rx="4" ry="4" width="5%" height="30" /> 
      <rect x="50%" y="620" rx="4" ry="4" width="17%" height="40" /> 
      <rect x="50%" y="680" rx="4" ry="4" width="12%" height="40" /> 
      <rect x="63%" y="680" rx="4" ry="4" width="12%" height="40" /> 
      <rect x="76%" y="680" rx="4" ry="4" width="12%" height="40" /> 
    </ContentLoader>
  )
}

export default ShoppingLoader
