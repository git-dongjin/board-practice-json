// 카테고리 데이터
const categories = [
  { id: "all", name: "전체보기", path: "/" }, // 추가
  { id: "blockchain", name: "블록체인", path: "/category/blockchain" },
  { id: "ai", name: "인공지능", path: "/category/ai" },
  { id: "bigdata", name: "빅데이터", path: "/category/big-data" },
  { id: "programming", name: "프로그래밍", path: "/category/programming" },
  { id: "cloud", name: "클라우드", path: "/category/cloud" },
  { id: "security", name: "정보보안", path: "/category/security" },
];

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

// 태그 관리
let tags = [];

function createWhiteCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL();
}

const editor = new toastui.Editor({
  el: document.querySelector("#editor"),
  height: "600px",
  initialEditType: "wysiwyg",
  previewStyle: "vertical",
  toolbarItems: [
    ["heading", "bold", "italic", "strike"],
    ["hr", "quote"],
    ["ul", "ol", "task", "indent", "outdent"],
    ["table", "image", "link"],
    ["code", "codeblock"],
    [
      {
        name: "drawing",
        tooltip: "그리기 도구",
        command: "drawingTool",
        text: "✏️",
        className: "toastui-editor-toolbar-icons",
      },
    ],
  ],
});

editor.addCommand("markdown", "drawingTool", () => {
  openDrawingTool();
});

editor.addCommand("wysiwyg", "drawingTool", () => {
  openDrawingTool();
});

const imageEditor = new tui.ImageEditor("#tui-image-editor", {
  includeUI: {
    loadImage: {
      path: createWhiteCanvas(1000, 600),
      name: "Blank",
    },
    uiSize: {
      width: "1000px",
      height: "600px",
    },
    menuBarPosition: "left",
  },
});

function renderTags() {
  const tagsList = document.getElementById("tagsList");
  tagsList.innerHTML = tags
    .map(
      (tag) => `
        <span class="tag-item">
          ${tag}
          <span class="tag-remove" data-tag="${tag}">&times;</span>
        </span>
      `
    )
    .join("");

  // 태그 삭제 이벤트 리스너 추가
  document.querySelectorAll(".tag-remove").forEach((button) => {
    button.addEventListener("click", (e) => {
      const tagToRemove = e.target.dataset.tag;
      tags = tags.filter((tag) => tag !== tagToRemove);
      renderTags();
    });
  });
}

// 태그 입력 처리
document.getElementById("tagInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const tag = e.target.value.trim();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
      renderTags();
      e.target.value = "";
    }
  }
});

// 카테고리 선택 처리
let selectedCategory = "";

document.querySelectorAll(".category-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-button").forEach((btn) => {
      btn.classList.remove("active");
    });
    button.classList.add("active");
    selectedCategory = button.dataset.category;
  });
});

function openDrawingTool() {
  document.getElementById("imageEditorPopup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  imageEditor.loadImageFromURL(createWhiteCanvas(1000, 600), "Blank");
}

function closeDrawingTool() {
  document.getElementById("imageEditorPopup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

function insertAndClose() {
  const imageUrl = imageEditor.toDataURL();
  if (editor.isMarkdownMode()) {
    editor.insertText(`![drawing](${imageUrl})`);
  } else {
    editor.exec("addImage", {
      imageUrl: imageUrl,
      altText: "drawing",
    });
  }
  closeDrawingTool();
}

// 게시물 제출
document.getElementById("submitPost").addEventListener("click", async () => {
  const title = document.getElementById("postTitle").value;
  const content = editor.getMarkdown();

  if (!title) {
    alert("제목을 입력해주세요.");
    return;
  }
  if (!selectedCategory) {
    alert("카테고리를 선택해주세요.");
    return;
  }
  if (!content) {
    alert("내용을 입력해주세요.");
    return;
  }

  // TODO: API 호출하여 게시물 저장
  console.log({
    title,
    category: selectedCategory,
    tags,
    content,
  });

  const formData = new FormData();
  formData.append("title", document.getElementById("postTitle").value);
  formData.append("content", editor.getHTML());
  formData.append("category", selectedCategory);
  formData.append("tags", JSON.stringify(tags));

  await createPost(formData);
});

// 게시물 작성
async function createPost(postData) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:3000/api/posts",
      postData
    );

    if (response.status === 201) {
      alert("게시물이 작성되었습니다.");
      window.location.href = "/";
    }
  } catch (error) {
    if (error.response) {
      // 서버가 응답을 반환했지만 에러 상태코드
      alert(error.response.data.message || "게시물 작성에 실패했습니다.");
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      alert("서버와 통신할 수 없습니다.");
    } else {
      // 요청 설정 중 에러 발생
      alert("요청을 보내는 중 오류가 발생했습니다.");
    }
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawingTool();
});
