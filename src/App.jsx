import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import LoadingSpiner from "./components/LoadingSpiner";
import { trackPromise } from "react-promise-tracker";

function App() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [uploadedComments, setUploadedComments] = useState([]);
  const [sortBy, setSortBy] = useState("newToOld"); // 初始值為由新到舊
  const [commentsPerPage, setCommentsPerPage] = useState(5); // 每頁顯示的留言篇數
  const [currentPage, setCurrentPage] = useState(1); // 當前頁數

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const scaleFactor = 500 / img.width; // 計算縮小比例
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 500;
          canvas.height = img.height * scaleFactor;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 將縮小後的圖片轉換為 Blob 對象
          canvas.toBlob((blob) => {
            const resizedFile = new File([blob], selectedFile.name, {
              type: selectedFile.type,
              lastModified: selectedFile.lastModified,
            });

            // 使用縮小後的圖片進行後續處理
            // 例如設定為 state 或上傳至伺服器等
            // 這裡只是示例，實際情況根據需要調整
            setFile(resizedFile);
          }, selectedFile.type);
        };
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleFileRemove = () => {
    if (file) {
      setFile(null);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault(); // 防止表單提交預設行為

    // 檢查是否有未填寫的欄位
    if (!file || !title || !description) {
      alert("請填寫所有必填欄位");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title); // 將標題加入 formData
    formData.append("description", description); // 將描述加入 formData

    // 將圖片檔名存入資料庫
    axios
      .post("https://commentapi.financialproblem.icu/upload", formData)
      .then((res) => {
        console.log(res.data);
        // 重新獲取所有已上傳的圖片資訊
        fetchUploadedComments();
        // 清除標題和描述的值
        setTitle("");
        setDescription("");
        setFile(null); // 重置 file
      })
      .catch((err) => console.log(err));
  };

  const handleCommentsPerPageChange = (e) => {
    const selectedCommentsPerPage = parseInt(e.target.value);
    setCommentsPerPage(selectedCommentsPerPage);
    setCurrentPage(1); // 當變更每頁篇數時，將當前頁數重設為第一頁
  };

  const totalPages = Math.ceil(uploadedComments.length / commentsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchUploadedComments = () => {
    trackPromise(
      axios
        .get("https://commentapi.financialproblem.icu/getImage")
        .then((res) => {
          setUploadedComments(res.data);
        })
        .catch((err) => console.log(err))
    );
  };

  useEffect(() => {
    fetchUploadedComments();
  }, []);

  return (
    <section className="wrap">
      <h1 className="site_title">曬貓板</h1>
      <div className="commentform">
        <div>
          <div className="textWrap">
            <label htmlFor="title">
              標題
              <input
                id="title"
                type="text"
                value={title}
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="請輸入標題"
                required
              />
            </label>

            <label htmlFor="description">
              貓咪敘述
              <textarea
                type="text"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="內容敘述"
              ></textarea>
            </label>
          </div>

          <div
            className="imgUploadWrap"
            style={
              file ? { background: `url(${URL.createObjectURL(file)})` } : null
            }
          >
            <label htmlFor="imagefile" className="custom-file-upload">
              <input
                id="imagefile"
                type="file"
                accept=".jpg, .jpeg, .png"
                onChange={handleFileChange}
                required
              />
              {file ? (
                <button onClick={handleFileRemove}>移除圖片</button>
              ) : (
                <h4>＋</h4>
              )}
            </label>
          </div>
        </div>

        <button onClick={handleUpload}> 發布貓咪</button>
      </div>

      <h2>所有貓咪</h2>
      <section className="navAndFilter">
        <ul className="filterBox">
          <li
            className={sortBy === "newToOld" ? "active" : ""}
            onClick={() => setSortBy("newToOld")}
          >
            新到舊
          </li>
          <li
            className={sortBy === "oldToNew" ? "active" : ""}
            onClick={() => setSortBy("oldToNew")}
          >
            舊到新
          </li>
          <li>
            <select
              name="commentsPerPage"
              id="commentsPerPage"
              value={commentsPerPage}
              onChange={handleCommentsPerPageChange}
            >
              <option value="5">顯示5篇</option>
              <option value="10">顯示10篇</option>
              <option value="15">顯示15篇</option>
              <option value="20">顯示20篇</option>
            </select>
          </li>
        </ul>

        <ul className="navigation">
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              上一頁
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, index) => (
            <li
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
            >
              <button onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              下一頁
            </button>
          </li>
        </ul>
      </section>
      <LoadingSpiner
        uploadedComments={uploadedComments}
        currentPage={currentPage}
        commentsPerPage={commentsPerPage}
        sortBy={sortBy}
      />
    </section>
  );
}

export default App;
