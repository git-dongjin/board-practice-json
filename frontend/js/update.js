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

// 전역 변수
let tags = [];
let selectedCategory = "";
let postId = "";
let editor;
let imageEditor;

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

// URL에서 게시물 ID 가져오기
function getPostIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// 그리기 도구 관련 함수
function createWhiteCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL();
}

// 에디터 초기화 함수
function initializeEditor() {
  const { Editor } = toastui;
  const { uml } = Editor.plugin;
  const { chart } = Editor.plugin;

  editor = new toastui.Editor({
    el: document.querySelector("#editor"),
    height: "600px",
    initialEditType: "wysiwyg",
    previewStyle: "vertical",
    plugins: [
      [uml, { rendererURL: "http://www.plantuml.com/plantuml/png/" }],
      [
        chart,
        {
          width: 900,
          height: 450,
          minWidth: 600,
          minHeight: 400,
          maxWidth: 1200,
          maxHeight: 600,
        },
      ],
    ],
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
        {
          name: "uml",
          tooltip: "UML 다이어그램",
          command: "umlDiagram",
          text: "📊",
          className: "toastui-editor-toolbar-icons",
        },
        {
          name: "chart",
          tooltip: "차트 삽입",
          command: "insertChart",
          text: "📈",
          className: "toastui-editor-toolbar-icons",
        },
      ],
    ],
  });

  // 커스텀 커맨드 추가
  addCustomCommands(editor);
}

function addCustomCommands(editor) {
  // 그리기 도구
  editor.addCommand("markdown", "drawingTool", () => {
    openDrawingTool();
  });
  editor.addCommand("wysiwyg", "drawingTool", () => {
    openDrawingTool();
  });

  // UML 다이어그램
  editor.addCommand("markdown", "umlDiagram", () => {
    const umlTemplate = `$$uml
participant User
participant Browser
participant Server
participant Database

User -> Browser: 로그인 시도
Browser -> Server: POST /login
Server -> Database: 사용자 검증
Database --> Server: 결과 반환
Server --> Browser: 응답
Browser --> User: 결과 표시
$$`;
    editor.insertText(umlTemplate);
  });

  editor.addCommand("wysiwyg", "umlDiagram", () => {
    const umlTemplate = `$$uml
participant User
participant Browser
participant Server
participant Database

User -> Browser: 로그인 시도
Browser -> Server: POST /login
Server -> Database: 사용자 검증
Database --> Server: 결과 반환
Server --> Browser: 응답
Browser --> User: 결과 표시
$$`;
    editor.setMarkdown(editor.getMarkdown() + "\n\n" + umlTemplate);
  });

  // 차트
  editor.addCommand("markdown", "insertChart", () => {
    const chartTemplate = `$$chart
,Seoul,Sydney,Moskva
Jan,20,5,30
Feb,40,30,5
Mar,25,21,18
Apr,50,18,21
May,15,59,33
Jun,45,50,21
Jul,33,28,29
Aug,34,33,15
Sep,20,21,33
Oct,40,18,21
Nov,75,59,29
Dec,50,50,15

type: area
title: Monthly Statisfaction
x.title: Cities
y.title: Popularity
y.min: 0
y.max: 80
series.spline: true
legend.align: bottom
$$`;
    editor.insertText(chartTemplate);
  });

  editor.addCommand("wysiwyg", "insertChart", () => {
    const chartTemplate = `$$chart
,Seoul,Sydney,Moskva
Jan,20,5,30
Feb,40,30,5
Mar,25,21,18
Apr,50,18,21
May,15,59,33
Jun,45,50,21
Jul,33,28,29
Aug,34,33,15
Sep,20,21,33
Oct,40,18,21
Nov,75,59,29
Dec,50,50,15

type: area
title: Monthly Statisfaction
x.title: Cities
y.title: Popularity
y.min: 0
y.max: 80
series.spline: true
legend.align: bottom
$$`;
    editor.setMarkdown(editor.getMarkdown() + "\n\n" + chartTemplate);
  });
}

// 그리기 도구 함수들
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

// 기존 게시물 데이터 불러오기
async function loadPostData() {
  try {
    postId = getPostIdFromUrl();
    if (!postId) {
      alert("게시물을 찾을 수 없습니다.");
      window.location.href = "/";
      return;
    }

    const response = await axios.get(
      `http://localhost:3000/api/posts/${postId}`
    );
    const post = response.data.data;

    // 데이터 채우기
    document.getElementById("postTitle").value = post.title;
    editor.setMarkdown(post.content);

    // 카테고리 선택
    selectedCategory = post.category;
    document.querySelectorAll(".category-button").forEach((button) => {
      if (button.dataset.category === post.category) {
        button.classList.add("active");
      }
    });

    // 태그 설정
    tags = post.tags || [];
    renderTags();
  } catch (error) {
    console.error("게시물 로드 실패:", error);
    alert("게시물을 불러오는데 실패했습니다.");
    window.location.href = "/";
  }
}

// 태그 렌더링
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

  // 태그 삭제 이벤트 리스너
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
document.querySelectorAll(".category-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-button").forEach((btn) => {
      btn.classList.remove("active");
    });
    button.classList.add("active");
    selectedCategory = button.dataset.category;
  });
});

// 게시물 수정 제출
document.getElementById("submitUpdate").addEventListener("click", async () => {
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

  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", selectedCategory);
    formData.append("tags", JSON.stringify(tags));

    const response = await axios.put(
      `http://localhost:3000/api/posts/${postId}`,
      formData
    );

    if (response.data.success) {
      alert("게시물이 수정되었습니다.");
      window.location.href = `/page/post.html?id=${postId}`;
    }
  } catch (error) {
    console.error("게시물 수정 실패:", error);
    alert("게시물 수정에 실패했습니다.");
  }
});

// 취소 버튼
document.getElementById("cancelUpdate").addEventListener("click", () => {
  if (confirm("수정을 취소하시겠습니까?")) {
    window.location.href = `/post.html?id=${postId}`;
  }
});

// ESC 키로 그리기 도구 닫기
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawingTool();
});

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  initializeEditor(); // 에디터 초기화를 먼저 수행
  renderCategories();
  loadPostData();
});
