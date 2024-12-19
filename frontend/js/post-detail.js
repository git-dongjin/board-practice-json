const categories = [
  { id: "all", name: "전체보기", path: "/" }, // 추가
  { id: "blockchain", name: "블록체인", path: "/category/blockchain" },
  { id: "ai", name: "인공지능", path: "/category/ai" },
  { id: "bigdata", name: "빅데이터", path: "/category/big-data" },
  { id: "programming", name: "프로그래밍", path: "/category/programming" },
  { id: "cloud", name: "클라우드", path: "/category/cloud" },
  { id: "security", name: "정보보안", path: "/category/security" },
];

const categoryMap = {
  blockchain: "블록체인",
  ai: "인공지능",
  bigdata: "빅데이터",
  programming: "프로그래밍",
  cloud: "클라우드",
  security: "정보보안",
};

// URL에서 게시물 ID 가져오기
function getPostIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// 카테고리 네비게이션 렌더링
function renderCategories() {
  const categoryNav = document.getElementById("categoryNav");
  const currentCategory = new URLSearchParams(window.location.search).get(
    "category"
  );

  categoryNav.innerHTML = categories
    .map(
      (category) => `
      <a href="/?category=${category.id}" 
        class="nav-link ${currentCategory === category.id ? "active" : ""}"
        data-category="${category.id}">
          ${category.name}
      </a>
  `
    )
    .join("");
}

// 게시물 데이터 가져오기
async function fetchPostDetail(postId) {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/posts/${postId}`
    );
    if (response.data.success) {
      renderPostDetail(response.data.data);
      renderComments(response.data.data);
    }
  } catch (error) {
    console.error("게시물 조회 실패:", error);
    document.getElementById("postDetail").innerHTML = `
      <div class="error-message">
        게시물을 불러오는데 실패했습니다.
      </div>
    `;
  }
}

// 게시물 상세 렌더링 수정
function renderPostDetail(post) {
  if (!post) return;

  const postDetail = document.getElementById("postDetail");
  postDetail.innerHTML = `
    <div class="post-header">
      <div class="post-header-top">
        <div class="post-category-group">
          <span class="post-category">${categoryMap[post.category]}</span>
          </div>
          <div class="post-buttons-group">
            <button class="btn edit-btn" onclick="handleEdit('${
              post.id
            }')">수정</button>
            <button class="btn delete-btn" onclick="handleDelete('${
              post.id
            }')">삭제</button>
          </div>
      </div>
      
      <h1 class="post-title">${post.title}</h1>
      
      <div class="post-meta">
        <div class="post-info">
          <span class="author">${post.author.name}</span>
          <span class="date">${new Date(
            post.createdAt
          ).toLocaleDateString()}</span>
          ${
            post.updatedAt !== post.createdAt
              ? `<span class="updated">(수정됨: ${new Date(
                  post.updatedAt
                ).toLocaleDateString()})</span>`
              : ""
          }
        </div>
        
        <div class="post-actions">
          <button class="btn like-btn" id="likeButton">
            👍 좋아요 ${post.likes}
          </button>
        </div>
      </div>

      <div class="post-tags">
        ${post.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </div>

    <div class="post-content" id="viewer">
    </div>
  `;

  const { chart, uml } = toastui.Editor.plugin;

  const viewer = toastui.Editor.factory({
    el: document.querySelector("#viewer"),
    initialValue: post.content,
    height: "auto",
    viewer: true,
    plugins: [
      [
        toastui.Editor.plugin.uml,
        { rendererURL: "http://www.plantuml.com/plantuml/png/" },
      ],
      [
        toastui.Editor.plugin.chart,
        {
          width: 900, // 기본 너비 900px로 증가
          height: 450, // 기본 높이 450px로 증가
          minWidth: 600, // 최소 너비 600px
          minHeight: 400, // 최소 높이 400px
          maxWidth: 1200, // 최대 너비 1200px
          maxHeight: 600, // 최대 높이 600px
        },
      ],
    ],
  });

  document
    .getElementById("likeButton")
    ?.addEventListener("click", () => handleLike(post.id));
}

// 수정 처리
async function handleEdit(postId) {
  // 수정 페이지로 이동
  window.location.href = `/page/update.html?edit=true&id=${postId}`;
}

// 삭제 처리
async function handleDelete(postId) {
  if (!confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
    return;
  }

  try {
    const response = await axios.delete(
      `http://localhost:3000/api/posts/${postId}`
    );
    if (response.data.success) {
      alert("게시물이 삭제되었습니다.");
      window.location.href = "/";
    }
  } catch (error) {
    console.error("게시물 삭제 실패:", error);
    alert("게시물 삭제에 실패했습니다.");
  }
}

// 댓글 관련 함수들 추가
async function createComment(postId, content) {
  try {
    console.log(content);
    const response = await axios.post(
      `http://localhost:3000/api/posts/${postId}/comments`,
      { content }
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("댓글 작성 실패:", error);
    alert("댓글 작성에 실패했습니다.");
  }
}

async function updateComment(postId, commentId, content) {
  try {
    const response = await axios.put(
      `http://localhost:3000/api/posts/${postId}/comments/${commentId}`,
      { content }
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("댓글 수정 실패:", error);
    alert("댓글 수정에 실패했습니다.");
  }
}

async function deleteComment(postId, commentId) {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/posts/${postId}/comments/${commentId}`
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    alert("댓글 삭제에 실패했습니다.");
  }
}

// 댓글 렌더링
function renderComments(post) {
  if (!post || !post.comments) return;

  const commentsSection = document.getElementById("commentsSection");
  commentsSection.innerHTML = `
    <div class="comments-header">
      <h2>댓글 ${post.comments.length}개</h2>
      <button id="addCommentButton" class="add-comment-button">댓글 작성</button>
    </div>

    <div id="commentForm" class="comment-form" style="display: none;">
      <textarea id="commentContent" placeholder="댓글을 입력하세요"></textarea>
      <div class="form-actions">
        <button id="submitComment">등록</button>
        <button id="cancelComment">취소</button>
      </div>
    </div>

    <div class="comments-list">
      ${renderCommentsList(post.comments)}
    </div>
  `;

  // 댓글 관련 이벤트 리스너 추가
  setupCommentEventListeners(post.id);
}

// 댓글 목록 렌더링 헬퍼 함수
// renderCommentsList 함수 수정
function renderCommentsList(comments) {
  return comments
    .map(
      (comment) => `
    <div class="comment" data-comment-id="${comment.id}">
      <div class="comment-header">
        <span class="comment-author">${comment.author.name}</span>
        <span class="comment-date">${new Date(
          comment.createdAt
        ).toLocaleDateString()}</span>
        <div class="comment-buttons">
          <button onclick="handleEditComment('${
            comment.id
          }')" class="btn edit-btn">수정</button>
          <button onclick="handleDeleteComment('${
            comment.id
          }')" class="btn delete-btn">삭제</button>
        </div>
      </div>
      <div class="comment-content" id="comment-content-${comment.id}">
        ${comment.content}
      </div>
      <div class="comment-edit-form" id="comment-edit-${
        comment.id
      }" style="display: none;">
        <textarea class="edit-textarea">${comment.content}</textarea>
        <div class="form-actions">
          <button onclick="submitCommentEdit('${
            comment.id
          }')" class="btn submit-btn">저장</button>
          <button onclick="cancelCommentEdit('${
            comment.id
          }')" class="btn cancel-btn">취소</button>
        </div>
      </div>
      <div class="comment-actions">
        <button class="like-button" onclick="handleCommentLike('${
          comment.id
        }')">
          👍 ${comment.likes}
        </button>
        <button class="reply-button" onclick="showReplyForm('${
          comment.id
        }')">답글</button>
      </div>
      ${renderReplies(comment.replies, comment.id)}
    </div>
  `
    )
    .join("");
}

// 댓글 수정/삭제 핸들러 함수들
function handleEditComment(commentId) {
  const contentDiv = document.getElementById(`comment-content-${commentId}`);
  const editForm = document.getElementById(`comment-edit-${commentId}`);

  if (contentDiv && editForm) {
    contentDiv.style.display = "none";
    editForm.style.display = "block";
  }
}

function submitCommentEdit(commentId) {
  const editForm = document.getElementById(`comment-edit-${commentId}`);
  const content = editForm.querySelector(".edit-textarea").value.trim();

  if (!content) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  const postId = getPostIdFromUrl();
  updateComment(postId, commentId, content);
}

function cancelCommentEdit(commentId) {
  const contentDiv = document.getElementById(`comment-content-${commentId}`);
  const editForm = document.getElementById(`comment-edit-${commentId}`);

  if (contentDiv && editForm) {
    contentDiv.style.display = "block";
    editForm.style.display = "none";
  }
}

function handleDeleteComment(commentId) {
  if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
    const postId = getPostIdFromUrl();
    deleteComment(postId, commentId);
  }
}

// 답글 관련 함수들
function renderReplies(replies, parentId) {
  if (!replies || replies.length === 0) return "";

  return `
    <div class="replies" data-parent-id="${parentId}">
      ${replies
        .map(
          (reply) => `
        <div class="reply" data-reply-id="${reply.id}">
          <div class="reply-header">
            <span class="reply-author">${reply.author.name}</span>
            <span class="reply-date">
              ${new Date(reply.createdAt).toLocaleDateString()}
            </span>
            <div class="reply-buttons">
              <button onclick="handleEditReply('${parentId}', '${
            reply.id
          }')" class="btn edit-btn">수정</button>
              <button onclick="handleDeleteReply('${parentId}', '${
            reply.id
          }')" class="btn delete-btn">삭제</button>
            </div>
          </div>
          <div class="reply-content" id="reply-content-${reply.id}">
            ${reply.content}
          </div>
          <div class="reply-edit-form" id="reply-edit-${
            reply.id
          }" style="display: none;">
            <textarea class="edit-textarea">${reply.content}</textarea>
            <div class="form-actions">
              <button onclick="submitReplyEdit('${parentId}', '${
            reply.id
          }')" class="btn submit-btn">저장</button>
              <button onclick="cancelReplyEdit('${
                reply.id
              }')" class="btn cancel-btn">취소</button>
            </div>
          </div>
          <div class="reply-footer">
            <button class="like-button" onclick="handleReplyLike('${parentId}', '${
            reply.id
          }')">
              👍 ${reply.likes || 0}
            </button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function showReplyForm(commentId) {
  const existingForm = document.querySelector(".reply-form");
  if (existingForm) {
    existingForm.remove();
  }

  const comment = document.querySelector(`[data-comment-id="${commentId}"]`);
  const replyForm = `
    <div class="reply-form">
      <textarea placeholder="답글을 입력하세요" class="reply-textarea"></textarea>
      <div class="form-actions">
        <button onclick="submitReply('${commentId}')" class="btn submit-btn">등록</button>
        <button onclick="cancelReply()" class="btn cancel-btn">취소</button>
      </div>
    </div>
  `;

  comment.insertAdjacentHTML("beforeend", replyForm);
}

async function submitReply(commentId) {
  const replyForm = document.querySelector(".reply-form");
  const content = replyForm.querySelector(".reply-textarea").value.trim();

  if (!content) {
    alert("답글 내용을 입력해주세요.");
    return;
  }

  const postId = getPostIdFromUrl();
  try {
    const response = await axios.post(
      `http://localhost:3000/api/posts/${postId}/comments/${commentId}/replies`,
      { content }
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("답글 작성 실패:", error);
    alert("답글 작성에 실패했습니다.");
  }
}

function cancelReply() {
  const replyForm = document.querySelector(".reply-form");
  if (replyForm) {
    replyForm.remove();
  }
}

// 좋아요 관련 함수들
async function handleCommentLike(commentId) {
  const postId = getPostIdFromUrl();
  try {
    const response = await axios.post(
      `http://localhost:3000/api/posts/${postId}/comments/${commentId}/like`
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("좋아요 처리 실패:", error);
    alert("좋아요 처리에 실패했습니다.");
  }
}

// 프론트엔드: handleReplyLike 함수 수정
async function handleReplyLike(commentId, replyId) {
  const postId = getPostIdFromUrl();
  try {
    const response = await axios.post(
      `http://localhost:3000/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("좋아요 처리 실패:", error);
    alert("좋아요 처리에 실패했습니다.");
  }
}

// 댓글 이벤트 리스너 설정
function setupCommentEventListeners(postId) {
  const commentForm = document.getElementById("commentForm");
  const addCommentButton = document.getElementById("addCommentButton");
  const submitComment = document.getElementById("submitComment");
  const cancelComment = document.getElementById("cancelComment");
  const commentContent = document.getElementById("commentContent");

  addCommentButton?.addEventListener("click", () => {
    commentForm.style.display = "block";
    addCommentButton.style.display = "none";
  });

  cancelComment?.addEventListener("click", () => {
    commentForm.style.display = "none";
    addCommentButton.style.display = "block";
    commentContent.value = "";
  });

  submitComment?.addEventListener("click", async () => {
    const content = commentContent.value.trim();
    if (!content) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/posts/${postId}/comments`,
        {
          content,
        }
      );

      if (response.data.success) {
        // 댓글 추가 후 게시물 다시 불러오기
        fetchPostDetail(postId);
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  });
}

// 좋아요 처리
async function handleLike(postId) {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/posts/${postId}/like`
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("좋아요 처리 실패:", error);
    alert("좋아요 처리에 실패했습니다.");
  }
}

// 답글 수정/삭제 함수들
async function handleEditReply(commentId, replyId) {
  const contentDiv = document.getElementById(`reply-content-${replyId}`);
  const editForm = document.getElementById(`reply-edit-${replyId}`);

  if (contentDiv && editForm) {
    contentDiv.style.display = "none";
    editForm.style.display = "block";
  }
}

async function submitReplyEdit(commentId, replyId) {
  const editForm = document.getElementById(`reply-edit-${replyId}`);
  const content = editForm.querySelector(".edit-textarea").value.trim();

  if (!content) {
    alert("답글 내용을 입력해주세요.");
    return;
  }

  const postId = getPostIdFromUrl();
  try {
    const response = await axios.put(
      `http://localhost:3000/api/posts/${postId}/comments/${commentId}/replies/${replyId}`,
      { content }
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("답글 수정 실패:", error);
    alert("답글 수정에 실패했습니다.");
  }
}

function cancelReplyEdit(replyId) {
  const contentDiv = document.getElementById(`reply-content-${replyId}`);
  const editForm = document.getElementById(`reply-edit-${replyId}`);

  if (contentDiv && editForm) {
    contentDiv.style.display = "block";
    editForm.style.display = "none";
  }
}

async function handleDeleteReply(commentId, replyId) {
  if (!confirm("정말로 이 답글을 삭제하시겠습니까?")) {
    return;
  }

  const postId = getPostIdFromUrl();
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/posts/${postId}/comments/${commentId}/replies/${replyId}`
    );
    if (response.data.success) {
      fetchPostDetail(postId);
    }
  } catch (error) {
    console.error("답글 삭제 실패:", error);
    alert("답글 삭제에 실패했습니다.");
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  const postId = getPostIdFromUrl();
  if (!postId) {
    window.location.href = "/";
    return;
  }

  renderCategories();
  fetchPostDetail(postId);
});
