import React from 'react'
import { PuffLoader } from "react-spinners";

const LoadingSpiner = () => {
  return (
    <div style={{paddingTop: "80px"}}>
      <PuffLoader color="#4ebaa4" />
    </div>
  )
}

export default LoadingSpiner