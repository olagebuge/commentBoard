import React from 'react'
import { PuffLoader } from "react-spinners";
import { usePromiseTracker} from "react-promise-tracker";

const LoadingSpiner = ({ uploadedComments, currentPage, commentsPerPage, sortBy }) => {

  return ( 
      <div className="cards">
      {usePromiseTracker().promiseInProgress ?
         <PuffLoader color="#4ebaa4" className="loader-margin"/>
        : (
          uploadedComments
            .sort((a, b) => {
              if (sortBy === "newToOld") {
                return new Date(b.date) - new Date(a.date); // 由新到舊
              } else if (sortBy === "oldToNew") {
                return new Date(a.date) - new Date(b.date); // 由舊到新
              }
              return 0;
            })
            .slice(
              (currentPage - 1) * commentsPerPage,
              currentPage * commentsPerPage
            ) // 根據當前頁數和每頁篇數進行篩選
            .map((comment, index) => {
              return (
                <div className="card" key={index}>
                  <h3 className="card-title">{comment.title}</h3>
                  <img
                    src={
                      `https://commentapi.financialproblem.icu/images/` +
                      comment.image
                    }
                  />
                  <p className="card-text">{comment.description}</p>
                  <p className="card-text">{comment.date.split("T")[0]}</p>
                </div>
              );
            })
        )}
    </div>
  )
}

export default LoadingSpiner