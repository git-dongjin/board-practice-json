// 카테고리 데이터
const categories = [
  { id: "all", name: "전체보기", path: "/" },
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

// 게시물 목록 가져오기
async function fetchPosts() {
  try {
    const response = await axios.get("http://localhost:3000/api/posts");
    if (response.data.success) {
      renderPosts(response.data.data);
    }
  } catch (error) {
    console.error("게시물 조회 실패:", error);
    document.getElementById("postList").innerHTML = `
      <div class="error-message">
        게시물을 불러오는데 실패했습니다.
      </div>
    `;
  }
}

// 카테고리 네비게이션 렌더링
function renderCategories() {
  const categoryNav = document.getElementById("categoryNav");
  const currentCategory = new URLSearchParams(window.location.search).get(
    "category"
  );

  categoryNav.innerHTML = categories
    .map((category) => {
      return `
      <a href="/?category=${category.id}" 
        class="nav-link ${currentCategory === category.id ? "active" : ""}"
        data-category="${category.id}">
          ${category.name}
      </a>
    `;
    })
    .join("");
}

// 게시물 목록 렌더링
function renderPosts(posts) {
  const postList = document.getElementById("postList");
  const currentCategory = new URLSearchParams(window.location.search).get(
    "category"
  );

  // Object.values()를 사용하여 posts 객체를 배열로 변환
  const postsArray = Object.values(posts);

  const filteredPosts =
    currentCategory && currentCategory !== "all"
      ? postsArray.filter(
          (post) =>
            post.category.toLowerCase() === currentCategory.toLowerCase()
        )
      : postsArray;

  if (!filteredPosts || filteredPosts.length === 0) {
    postList.innerHTML = `
      <div class="no-posts">
        <p class="no-posts-message">게시물이 없습니다.</p>
      </div>
    `;
    return;
  }

  postList.innerHTML = filteredPosts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(
      (post) => `
      <article class="post-card">
        <div class="post-content">
          <div class="post-header">
            <span class="category-tag">${categoryMap[post.category]}</span>
            <span class="post-date">${new Date(
              post.createdAt
            ).toLocaleDateString()}</span>
          </div>
          <h2 class="post-title">
            <a href="page/post.html?id=${post.id}">${post.title}</a>
          </h2>
          <div class="post-tags">
            ${post.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join("")}
          </div>
          <div class="post-meta">
            <span class="author">${post.author.name}</span>
            <div class="post-stats">
              <span>👍 ${post.likes}</span>
              <span>💬 ${post.comments.length}</span>
            </div>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  fetchPosts(); // MOCK_POSTS 대신 서버에서 데이터 가져오기

  // 카테고리 클릭 이벤트 처리
  document
    .getElementById("categoryNav")
    .addEventListener("click", async (e) => {
      if (e.target.classList.contains("nav-link")) {
        e.preventDefault();
        const category = e.target.dataset.category;

        // 모든 nav-link에서 active 클래스 제거
        document.querySelectorAll(".nav-link").forEach((link) => {
          link.classList.remove("active");
        });

        // 클릭된 링크에 active 클래스 추가
        e.target.classList.add("active");

        window.history.pushState({}, "", `?category=${category}`);
        await fetchPosts(); // 서버에서 데이터 다시 가져오기
      }
    });
});

// 브라우저 히스토리 변경 처리
window.addEventListener("popstate", () => {
  fetchPosts();
});
