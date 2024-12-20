import { Button, Modal } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./ModalThread.css";
import { toast } from "react-toastify";
import {
  postComment,
  getPostComments,
  handleUpdatePost,
  handleDeletePost,
  handleDeleteComment,
} from "../../services/userService";
import ModalDelete from "../ManagePosts/ModalDelete";
import ModalDeleteCmt from "../ManageComments/ModalDelete";

const ModalThread = (props) => {
  const { currentPost, user, dateTime, liked } = props;
  const [comment, setComment] = useState("");
  const [postComments, setPostComments] = useState([]);
  const [listView, setListView] = useState(false);
  const [visibleId, setVisibleId] = useState(null);
  const [updatePost, setUpdatePost] = useState(false);
  const [titlePost, setTitlePost] = useState(currentPost.content);
  const [isShowModalDelete, setIsShowModalDelete] = useState(false);
  const [isShowModalDeleteCmt, setIsShowModalDeleteCmt] = useState(false);
  const [dataCmtModal, setDataCmtModal] = useState({});
  const textareaRefs = useRef([]);
  const postContentRef = useRef(null);
  const divRefs = useRef([]);

  useEffect(() => {
    // Cập nhật chiều cao của div theo chiều cao của textarea
    postComments.forEach((_, index) => {
      const textarea = textareaRefs.current[index];
      const div = divRefs.current[index];

      if (textarea && div) {
        // Đặt chiều cao textarea về auto để reset
        textarea.style.height = "auto";
        // Cập nhật chiều cao mới của textarea
        textarea.style.height = `${textarea.scrollHeight}px`;

        // Cập nhật chiều cao của div cha theo chiều cao của textarea
        div.style.height = `${textarea.scrollHeight}px`;
      }
    });
  }, [postComments]); // Chạy lại mỗi khi postComments thay đổi

  const handlePostComment = async () => {
    if (comment === "") {
      toast.error("You haven't comment!!!");
      return;
    }
    let data = {
      post_id: currentPost.id,
      content: comment,
    };
    let response = await postComment(data);
    if (response && +response.status === 201) {
      await fetchComment();
      setComment("");
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const fetchComment = async () => {
    let response = await getPostComments(currentPost.id);
    if (response && +response.status === 200) {
      setPostComments(response.comments);
    }
  };

  const handleCloseModalThread = () => {
    setComment("");
    setPostComments({});
    props.onHide();
  };

  const handleLike = async (post_id) => {
    props.setLiked(!liked, post_id);
  };

  const getTimePost = (postDate) => {
    let date2 = new Date(postDate + "+0700");
    const differenceInMilliseconds = dateTime - date2;
    let sencond = Math.floor(differenceInMilliseconds / 1000);
    let minute = Math.floor(differenceInMilliseconds / (1000 * 60));
    let hour = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    let day = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    if (sencond < 60) return sencond + "s";
    if (minute < 60) return minute + "m";
    if (hour < 24) return hour + "h";
    return day + "d";
  };

  const toggleView = (id) => {
    setVisibleId(visibleId === id ? null : id); // Bật/tắt hiển thị cho phần tử cụ thể
  };

  const handlePostFocus = () => {
    if (postContentRef.current) {
      postContentRef.current.focus(); // Đặt focus vào thẻ input
    }
  };

  const editItem = () => {
    setUpdatePost(true);
    setListView(false);
    handlePostFocus();
  };

  const UpdatePost = async () => {
    let response = await handleUpdatePost(currentPost.id, {
      content: titlePost,
    });
    if (response && +response.status === 200) {
      setUpdatePost(false);
      toast.success(response.message);
    } else {
      setUpdatePost(false);
      toast.error(response.message);
    }
  };

  const deleteItem = () => {
    setIsShowModalDelete(true);
    setListView(false);
  };

  const handleClose = () => {
    setIsShowModalDelete(false);
  };

  const DeletePost = async () => {
    let response = await handleDeletePost(currentPost.id);
    if (response && +response.status === 200) {
      toast.success(response.message);
      window.location.reload();
    } else {
      toast.error(response.message);
    }
  };

  const deleteComment = (data) => {
    setDataCmtModal(data);
    setIsShowModalDeleteCmt(true);
    setVisibleId(null);
  };

  const handleCloseCmt = () => {
    setDataCmtModal({});
    setIsShowModalDeleteCmt(false);
  };

  const DeleteComment = async () => {
    let response = await handleDeleteComment(dataCmtModal.id);
    if (response && +response.status === 200) {
      toast.success(response.message);
      window.location.reload();
    } else {
      toast.error(response.message);
    }
  };

  useEffect(() => {
    if (props.show) {
      fetchComment();
    }
  }, [props.show, currentPost.id]);

  return (
    <>
      <Modal
        size="lg"
        show={props.show}
        onHide={() => handleCloseModalThread()}
        backdropClassName="custom-backdrop"
      >
        <Modal.Body>
          <div className="content-post">
            <div className="content-right">
              <div className="logo">
                <img
                  src={"http://localhost:5000" + currentPost.avatar}
                  alt="logo"
                  width="40"
                  height="40"
                ></img>
                <div className="follow">
                  {/* <i class="fa-solid fa-circle-plus"></i> */}
                </div>
              </div>
            </div>
            <div className="content-left">
              <div className="top">
                <Link
                  className="link-profile"
                  to={
                    user.account.username === currentPost.author
                      ? "/profile"
                      : `/profile/${currentPost.author}`
                  }
                >
                  <div className="username">
                    {currentPost.author}
                    {/* <i class="fa-solid fa-circle-check"></i> */}
                  </div>
                </Link>

                <div className="time">
                  {getTimePost(currentPost.created_at)}{" "}
                  {user.account.username === currentPost.author ? (
                    <i
                      class="fa-solid fa-ellipsis"
                      onClick={() => setListView(!listView)}
                    ></i>
                  ) : (
                    ""
                  )}
                  <div
                    class={
                      listView ? "button-container" : "hide-button-container"
                    }
                  >
                    <button class="edit-btn" onClick={() => editItem()}>
                      Sửa
                    </button>
                    <button class="delete-btn" onClick={() => deleteItem()}>
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
              <div className="title">
                {/* {currentPost.content} */}
                <input
                  ref={postContentRef}
                  className={updatePost ? "post-title" : "post-title-update"}
                  type="text"
                  value={titlePost}
                  onChange={(event) => {
                    setTitlePost(event.target.value);
                  }}
                ></input>
                <div
                  className={updatePost ? "button-group" : "hide-button-group "}
                >
                  <Button
                    className="btn btn-success btn-sm"
                    onClick={() => UpdatePost()}
                  >
                    OK
                  </Button>
                  <Button className="btn btn-danger btn-sm mx-1">Hủy</Button>
                </div>
              </div>
              {currentPost.media_url ? (
                <div className="img-content">
                  <img
                    src={"http://localhost:5000" + currentPost.media_url}
                    alt="img"
                    width="100%"
                    height="316"
                  ></img>
                </div>
              ) : (
                <></>
              )}
              <div className="icon">
                <i
                  className={
                    liked === true
                      ? "fa-solid fa-heart fa-lg liked"
                      : "fa-regular fa-heart fa-lg"
                  }
                  onClick={() => handleLike(currentPost.id)}
                ></i>
                <i class="fa-regular fa-comment fa-lg"></i>
                {/* <i class="fa-solid fa-retweet fa-lg"></i> */}
                {/* <i class="fa-regular fa-share-from-square fa-lg"></i> */}
              </div>
            </div>
          </div>
          <div className="comment">
            <div className="user-comment">
              <div className="avt col-1">
                <img
                  src={"http://localhost:5000" + user.account.avatar_url}
                  alt="logo"
                  width="40"
                  height="40"
                ></img>
              </div>
              <div className="title col-10">
                <textarea
                  className="user-comment-area"
                  name="userCommentArea"
                  placeholder="Comment"
                  value={comment}
                  onChange={handleCommentChange}
                />
              </div>
              <div className="btn-comment col-1">
                <i
                  class="fa-solid fa-paper-plane fa-2x"
                  onClick={() => handlePostComment()}
                ></i>
              </div>
            </div>
            <div className="list-comment">
              {postComments && postComments.length > 0 ? (
                <>
                  {postComments.map((item, index) => (
                    <div className="content-comment">
                      <div className="user">
                        <div className="avt">
                          <img
                            src={"http://localhost:5000" + item.user.avt}
                            alt="logo"
                            width="40"
                            height="40"
                          />
                          <Link
                            className="link-profile"
                            to={
                              user.account.username === item.user.username
                                ? "/profile"
                                : `/profile/${item.user.username}`
                            }
                          >
                            <p>{item.user.username}</p>
                          </Link>
                        </div>
                        <div className="report">
                          {user.account.username === item.user.username ? (
                            <i
                              class="fa-solid fa-ellipsis"
                              onClick={() => toggleView(item.id)}
                            ></i>
                          ) : (
                            ""
                          )}
                          <div
                            class={
                              visibleId === item.id
                                ? "button-container"
                                : "hide-button-container"
                            }
                          >
                            <button
                              class="delete-btn"
                              onClick={() => deleteComment(item)}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        className="title"
                        ref={(el) => (divRefs.current[index] = el)} // Tham chiếu div cha
                      >
                        <textarea
                          ref={(el) => (textareaRefs.current[index] = el)} // Tham chiếu textarea
                          className="comment-area"
                          name="comment-area"
                          value={item.content}
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ModalDelete
        show={isShowModalDelete}
        handleClose={handleClose}
        confirmDeletePost={DeletePost}
        dataModal={currentPost}
      />

      <ModalDeleteCmt
        show={isShowModalDeleteCmt}
        handleClose={handleCloseCmt}
        confirmDeleteComment={DeleteComment}
        dataModal={dataCmtModal}
      />
    </>
  );
};

export default ModalThread;
