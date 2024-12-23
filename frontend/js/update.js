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
      [
        {
          name: "d3-editor",
          tooltip: "D3 에디터",
          command: "openD3Editor",
          className: "toastui-editor-toolbar-icons d3-editor",
          text: "✏️",
        },
      ],
    ],
  });

  // 커스텀 커맨드 추가
  addCustomCommands(editor);
}

function addCustomCommands(editor) {
  // WYSIWYG 모드용 커맨드
  editor.addCommand("wysiwyg", "openD3Editor", () => {
    const modal = document.querySelector(".d3-editor-modal");
    modal.style.display = "block";
    if (!window.d3Editor) {
      window.d3Editor = new D3Editor();
    }
  });

  // Markdown 모드용 커맨드
  editor.addCommand("markdown", "openD3Editor", () => {
    const modal = document.querySelector(".d3-editor-modal");
    modal.style.display = "block";
    if (!window.d3Editor) {
      window.d3Editor = new D3Editor();
    }
  });

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

// D3 EDITOR
class D3Editor {
  constructor() {
    this.currentTool = null;
    this.svg = null;
    this.mainLayer = null;
    this.stampsContainer = null;
    this.selectedStamp = null;
    this.isDrawing = false;
    this.penWidth = 4;
    this.currentModal = null;
    this.selectedElements = new Set(); // 선택된 요소들 추적
    this.selectionRect = null; // 선택 영역 rectangle
    this.selectionStart = null; // 선택 시작 좌표

    // 기본 제공 스탬프
    this.stamps = [
      "http://localhost:3000/api/uploads/firefox.svg",
      "http://localhost:3000/api/uploads/linux.svg",
      "http://localhost:3000/api/uploads/redhat.svg",
      "http://localhost:3000/api/uploads/ubuntu.svg",
      "http://localhost:3000/api/uploads/apiGateway.svg",
      "http://localhost:3000/api/uploads/lambda.svg",
      "http://localhost:3000/api/uploads/dynamoDB.svg",
      "http://localhost:3000/api/uploads/arrow.svg",
    ];

    this.initCanvas();
    this.initEvents();
  }

  initCanvas() {
    // SVG 캔버스 생성
    this.svg = d3
      .select("#d3-canvas")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    // 메인 레이어
    this.mainLayer = this.svg.append("g").attr("class", "main-layer");

    // 스탬프 컨테이너
    this.stampsContainer = this.mainLayer
      .append("g")
      .attr("class", "stamps-container");
  }

  initEvents() {
    // 툴바 버튼 이벤트
    document.getElementById("stamp-tool").addEventListener("click", () => {
      this.setTool("stamp");
      this.openStampSelect();
    });

    document.getElementById("pen-tool").addEventListener("click", () => {
      this.setTool("pen");
      this.openPenSettings();
      this.initPenTool();
    });

    document.getElementById("eraser-tool").addEventListener("click", () => {
      this.setTool("eraser");
      this.initEraserTool();
    });

    document.getElementById("close-editor").addEventListener("click", () => {
      document.querySelector(".d3-editor-modal").style.display = "none";
    });

    // document.getElementById("save-svg").addEventListener("click", () => {
    //   this.saveSVG();
    // });

    document.getElementById("select-tool").addEventListener("click", () => {
      this.setTool("select");
      this.initSelectTool();
    });

    // 툴 버튼들만 선택 (전체 삭제 버튼 제외)
    const toolBtns = document.querySelectorAll(
      "#select-tool, #stamp-tool, #pen-tool, #eraser-tool"
    );

    toolBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        toolBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // 전체 삭제 버튼 이벤트
    document.getElementById("clear-all").addEventListener("click", () => {
      if (confirm("모든 요소를 삭제하시겠습니까?")) {
        this.clearAll();
      }
    });

    document.getElementById("save-svg").addEventListener("click", () => {
      this.saveSvg();
    });
  }

  async saveSvg() {
    try {
      // 원본 SVG 복사
      const originalSvg = this.svg.node();
      const tempSvg = originalSvg.cloneNode(true);

      // SVG 기본 스타일 및 속성 설정
      tempSvg.setAttribute("width", "800");
      tempSvg.setAttribute("height", "600");
      tempSvg.style.cssText = "cursor: default; background-color: white;";

      // handle 요소 제거 (있다면)
      tempSvg.querySelectorAll(".handle").forEach((handle) => handle.remove());

      // 스탬프 이미지 Base64 변환
      const images = tempSvg.querySelectorAll("image");
      for (let img of images) {
        try {
          const response = await fetch(img.getAttribute("href"));
          const blob = await response.blob();

          // Blob을 Base64로 변환
          const reader = new FileReader();
          const base64data = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          // href 속성을 Base64로 교체
          img.setAttribute("href", base64data);
        } catch (error) {
          console.error("이미지 변환 중 오류:", error);
        }
      }

      // SVG를 문자열로 변환
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(tempSvg);

      // SVG 인코딩
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
      const url =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

      // 서버로 업로드
      const blob = new Blob([source], { type: "image/svg+xml" });
      const formData = new FormData();
      formData.append("svg", blob, "drawing.svg");

      const response = await fetch("http://localhost:3000/api/uploads/svg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("SVG 업로드 실패");
      }

      this.clearAll();

      const { url: uploadedUrl } = await response.json();
      // 현재 모드 저장
      const currentMode = editor.isMarkdownMode();

      // 마크다운 모드로 전환
      if (!currentMode) {
        editor.changeMode("markdown");
      }

      // 이미지 삽입
      editor.insertText(`![svg](http://localhost:3000${uploadedUrl})`);

      // 원래 모드로 복귀
      if (!currentMode) {
        editor.changeMode("wysiwyg");
      }

      document.querySelector(".d3-editor-modal").style.display = "none";
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  }

  getEditor() {
    // Toast UI Editor 인스턴스 반환
    return window.editor;
  }

  closeEditor() {
    // 에디터 모달 닫기
    document.querySelector(".d3-editor-modal").style.display = "none";
  }

  setTool(tool) {
    this.currentTool = tool;
    this.closeCurrentModal();
    this.svg.style("cursor", tool === "stamp" ? "crosshair" : "default");
  }

  closeCurrentModal() {
    // 현재 열린 모달 제거
    const modals = document.querySelectorAll(
      ".stamp-select-modal, .pen-settings-modal"
    );
    modals.forEach((modal) => modal.remove());
    this.currentModal = null;
  }

  openStampSelect() {
    this.closeCurrentModal();
    const modal = document.createElement("div");
    modal.className = "stamp-select-modal";
    modal.innerHTML = `
        <div class="stamp-grid">
            ${this.stamps
              .map(
                (stamp) => `
                <div class="stamp-item">
                    <img src="${stamp}" alt="stamp">
                </div>
            `
              )
              .join("")}
        </div>
    `;

    // D3 에디터 컨테이너에 모달 추가
    document.querySelector(".d3-editor-container").appendChild(modal);
    this.currentModal = modal;

    // 스탬프 선택 이벤트
    modal.querySelectorAll(".stamp-item").forEach((item, index) => {
      item.addEventListener("click", () => {
        this.selectedStamp = this.stamps[index];
        modal.remove();
        this.initStampPlacement();
      });
    });
  }

  initStampPlacement() {
    this.svg.on("click", (event) => {
      if (this.currentTool === "stamp" && this.selectedStamp) {
        const [x, y] = d3.pointer(event);
        this.placeStamp(x, y);
      }
    });
  }

  placeStamp(x, y) {
    const stamp = this.stampsContainer
      .append("g")
      .attr("class", "stamp")
      .attr("transform", `translate(${x}, ${y})`);

    stamp
      .append("image")
      .attr("href", this.selectedStamp)
      .attr("width", 50)
      .attr("height", 50)
      .attr("x", -25)
      .attr("y", -25);

    stamp
      .append("circle")
      .attr("class", "handle rotate-handle")
      .attr("cx", 0)
      .attr("cy", -40)
      .attr("r", 4);

    stamp
      .append("rect")
      .attr("class", "handle scale-handle")
      .attr("x", 21)
      .attr("y", 21)
      .attr("width", 8)
      .attr("height", 8);

    this.initStampControls(stamp, x, y);
  }

  initStampControls(stamp, initialX, initialY) {
    const transform = {
      x: initialX,
      y: initialY,
      rotate: 0,
      scale: 1,
    };

    // 이동 드래그
    const dragMove = d3.drag().on("drag", (event) => {
      transform.x += event.dx;
      transform.y += event.dy;
      this.updateStampTransform(stamp, transform);
    });

    // 회전 드래그
    const dragRotate = d3.drag().on("drag", (event) => {
      const [mouseX, mouseY] = d3.pointer(event, this.svg.node());
      const stampCenter = this.getStampCenter(stamp);
      const angle =
        (Math.atan2(mouseY - stampCenter.y, mouseX - stampCenter.x) * 180) /
        Math.PI;
      transform.rotate = angle + 90;
      this.updateStampTransform(stamp, transform);
    });

    // 크기 조절 드래그
    const dragScale = d3
      .drag()
      .on("start", (event) => {
        event.subject.startScale = transform.scale;
        const [mouseX, mouseY] = d3.pointer(event, this.svg.node());
        const stampCenter = this.getStampCenter(stamp);
        event.subject.startDistance = Math.hypot(
          mouseX - stampCenter.x,
          mouseY - stampCenter.y
        );
      })
      .on("drag", (event) => {
        const [mouseX, mouseY] = d3.pointer(event, this.svg.node());
        const stampCenter = this.getStampCenter(stamp);
        const currentDistance = Math.hypot(
          mouseX - stampCenter.x,
          mouseY - stampCenter.y
        );

        transform.scale =
          event.subject.startScale *
          (currentDistance / event.subject.startDistance);
        this.updateStampTransform(stamp, transform);
      });

    // 드래그 이벤트 바인딩
    stamp.call(dragMove);
    stamp.select(".rotate-handle").call(dragRotate);
    stamp.select(".scale-handle").call(dragScale);

    // 컨트롤+클릭으로 삭제
    stamp.on("click", function (event) {
      if (event.ctrlKey || event.metaKey) {
        event.stopPropagation();
        d3.select(this).remove();
      }
    });
  }

  getStampCenter(stamp) {
    const transform = stamp.attr("transform");
    const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
    return {
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    };
  }

  updateStampTransform(stamp, transform) {
    stamp.attr(
      "transform",
      `translate(${transform.x}, ${transform.y}) rotate(${transform.rotate}) scale(${transform.scale})`
    );
  }

  saveSVG() {
    // SVG를 문자열로 변환
    const svgData = this.svg.node().outerHTML;
    // Toast UI Editor에 삽입
    editor.insertText(svgData);
    // 모달 닫기
    document.querySelector(".d3-editor-modal").style.display = "none";
  }

  showStampPreview() {
    // 기존 프리뷰 제거
    this.svg.select(".stamp-preview").remove();

    // 새 프리뷰 생성
    const preview = this.svg
      .append("image")
      .attr("class", "stamp-preview")
      .attr("href", this.selectedStamp)
      .attr("width", 50)
      .attr("height", 50)
      .style("opacity", 0.5)
      .style("pointer-events", "none");

    // 마우스 이동에 따른 프리뷰 위치 업데이트
    this.svg.on("mousemove", (event) => {
      if (this.currentTool !== "stamp") return;
      const [x, y] = d3.pointer(event);
      preview.attr("x", x - 25).attr("y", y - 25);
    });

    // 클릭 시 스탬프 배치 - 수정된 부분
    this.svg.on("click", (event) => {
      if (this.currentTool !== "stamp" || event.ctrlKey || event.metaKey)
        return;
      const [x, y] = d3.pointer(event);
      this.placeStamp(x, y);
    });
  }

  initPenTool() {
    let isDrawing = false;
    let currentPath = null;
    let points = [];

    this.svg
      .on("mousedown", (event) => {
        if (this.currentTool !== "pen") return;
        isDrawing = true;
        const [x, y] = d3.pointer(event);
        points = [[x, y]];
        currentPath = this.mainLayer
          .append("path")
          .attr("class", "pen-path")
          .attr("fill", "none")
          .attr("stroke", "#000")
          .attr("stroke-width", this.penWidth)
          .attr("d", d3.line()(points));
      })
      .on("mousemove", (event) => {
        if (!isDrawing || this.currentTool !== "pen") return;
        const [x, y] = d3.pointer(event);
        points.push([x, y]);
        currentPath.attr("d", d3.line().curve(d3.curveBasis)(points));
      })
      .on("mouseup", () => {
        isDrawing = false;
      })
      .on("mouseleave", () => {
        isDrawing = false;
      });
  }

  initEraserTool() {
    const eraserSize = 20; // 지우개 크기

    // 지우개 커서 생성
    let eraserCursor = this.svg.select(".eraser-cursor");
    if (eraserCursor.empty()) {
      eraserCursor = this.svg
        .append("circle")
        .attr("class", "eraser-cursor")
        .attr("r", eraserSize / 2)
        .style("display", "none");
    }

    this.svg
      .on("mousemove", (event) => {
        if (this.currentTool !== "eraser") {
          eraserCursor.style("display", "none");
          return;
        }

        const [x, y] = d3.pointer(event);
        eraserCursor.attr("cx", x).attr("cy", y).style("display", "block");

        if (event.buttons === 1) {
          // 마우스 왼쪽 버튼을 누른 상태
          this.mainLayer.selectAll("path.pen-path").each(function () {
            const path = d3.select(this);
            const pathNode = this;
            const bounds = pathNode.getBBox();
            if (
              x >= bounds.x &&
              x <= bounds.x + bounds.width &&
              y >= bounds.y &&
              y <= bounds.y + bounds.height
            ) {
              path.remove();
            }
          });
        }
      })
      .on("mouseleave", () => {
        eraserCursor.style("display", "none");
      });
  }

  openPenSettings() {
    this.closeCurrentModal();
    const modal = document.createElement("div");
    modal.className = "pen-settings-modal";
    modal.innerHTML = `
      <div class="setting-item">
        <label>펜 두께</label>
        <div class="setting-control">
          <input type="range" id="pen-width" min="1" max="10" value="${this.penWidth}" step="1">
          <span id="pen-width-value">${this.penWidth}px</span>
        </div>
      </div>
    `;

    document.querySelector(".d3-editor-container").appendChild(modal);
    this.currentModal = modal;

    const widthSlider = modal.querySelector("#pen-width");
    const widthValue = modal.querySelector("#pen-width-value");

    widthSlider.addEventListener("input", (e) => {
      this.penWidth = parseInt(e.target.value);
      widthValue.textContent = `${this.penWidth}px`;
    });
  }

  initSelectTool() {
    // 기존 이벤트 리스너 제거
    this.svg
      .on("mousedown.select", null)
      .on("mousemove.select", null)
      .on("mouseup.select", null)
      .on("click.select", null);

    // 선택 영역 그리기 시작
    this.svg.on("mousedown.select", (event) => {
      if (this.currentTool !== "select") return;
      if (event.target !== this.svg.node()) return; // SVG 빈 영역에서만 선택 상자 시작

      if (!event.shiftKey) {
        this.clearSelection();
      }

      const [x, y] = d3.pointer(event);
      this.selectionStart = [x, y];

      this.selectionRect = this.svg
        .append("rect")
        .attr("class", "selection-rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", 0)
        .attr("height", 0)
        .attr("fill", "rgba(0, 123, 255, 0.1)")
        .attr("stroke", "#007bff")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");
    });

    // 선택 영역 드래그
    this.svg.on("mousemove.select", (event) => {
      if (!this.selectionRect || this.currentTool !== "select") return;

      const [currentX, currentY] = d3.pointer(event);
      const [startX, startY] = this.selectionStart;

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      this.selectionRect
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height);
    });

    // 선택 완료
    this.svg.on("mouseup.select", () => {
      if (!this.selectionRect || this.currentTool !== "select") return;

      const bounds = this.selectionRect.node().getBBox();

      this.mainLayer.selectAll(".stamp, .pen-path").each((d, i, nodes) => {
        const el = nodes[i];
        const elBounds = el.getBBox();
        const elTransform = el.getAttribute("transform");
        let tx = 0,
          ty = 0;

        if (elTransform) {
          const match = elTransform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            tx = parseFloat(match[1]);
            ty = parseFloat(match[2]);
          }
        }

        const adjustedBounds = {
          x: elBounds.x + tx,
          y: elBounds.y + ty,
          width: elBounds.width,
          height: elBounds.height,
        };

        if (this.boundsIntersect(bounds, adjustedBounds)) {
          this.selectedElements.add(el);
          d3.select(el).classed("selected", true);
        }
      });

      this.selectionRect.remove();
      this.selectionRect = null;
      this.selectionStart = null;
      this.updateGroupBounds();
    });

    // 선택된 요소 드래그 이벤트
    const dragElements = d3.drag().on("drag", (event) => {
      if (this.currentTool !== "select") return;

      // 선택된 모든 요소 이동
      this.selectedElements.forEach((el) => {
        const currentTransform = el.getAttribute("transform") || "";
        const translate = currentTransform.match(
          /translate\(([^,]+),([^)]+)\)/
        );
        const x = translate ? parseFloat(translate[1]) : 0;
        const y = translate ? parseFloat(translate[2]) : 0;

        const newX = x + event.dx;
        const newY = y + event.dy;

        let newTransform = currentTransform;
        if (translate) {
          newTransform = currentTransform.replace(
            /translate\([^)]*\)/,
            `translate(${newX}, ${newY})`
          );
        } else {
          newTransform = `translate(${newX}, ${newY}) ${currentTransform}`;
        }

        el.setAttribute("transform", newTransform);
      });
      this.updateGroupBounds();
    });

    // 스탬프와 펜 패스에 드래그 이벤트 적용
    this.mainLayer
      .selectAll(".stamp, .pen-path")
      .on("mousedown", (event) => {
        if (this.currentTool !== "select") return;

        const target = event.currentTarget;
        if (!target.classList.contains("selected")) {
          if (!event.shiftKey) {
            this.clearSelection();
          }
          this.selectedElements.add(target);
          d3.select(target).classed("selected", true);
        }
      })
      .call(dragElements);

    // Delete 키로 선택된 요소들 일괄 삭제
    document.addEventListener("keydown", (event) => {
      if (event.key === "Delete" && this.currentTool === "select") {
        this.selectedElements.forEach((el) => {
          d3.select(el).remove();
        });
        this.selectedElements.clear();
      }
    });
  }

  clearSelection() {
    this.selectedElements.forEach((el) => {
      d3.select(el).classed("selected", false);
    });
    this.selectedElements.clear();
  }

  boundsIntersect(b1, b2) {
    return !(
      b2.x > b1.x + b1.width ||
      b2.x + b2.width < b1.x ||
      b2.y > b1.y + b1.height ||
      b2.y + b2.height < b1.y
    );
  }

  updateGroupBounds() {
    // 기존 그룹 바운딩 박스 제거
    this.svg.selectAll(".group-bounds").remove();

    if (this.selectedElements.size > 0) {
      // 1개 이상 선택된 경우로 수정
      // 모든 선택된 요소들의 바운딩 박스 계산
      let minX = Infinity,
        minY = Infinity;
      let maxX = -Infinity,
        maxY = -Infinity;

      this.selectedElements.forEach((el) => {
        const bounds = el.getBBox();
        const transform = el.getAttribute("transform");
        let tx = 0,
          ty = 0;
        let scale = 1;

        if (transform) {
          const translateMatch = transform.match(
            /translate\(([^,]+),([^)]+)\)/
          );
          if (translateMatch) {
            tx = parseFloat(translateMatch[1]);
            ty = parseFloat(translateMatch[2]);
          }

          const scaleMatch = transform.match(/scale\(([^)]+)\)/);
          if (scaleMatch) {
            scale = parseFloat(scaleMatch[1]);
          }
        }

        // 스케일을 고려한 바운딩 박스 계산
        minX = Math.min(minX, bounds.x * scale + tx);
        minY = Math.min(minY, bounds.y * scale + ty);
        maxX = Math.max(maxX, (bounds.x + bounds.width) * scale + tx);
        maxY = Math.max(maxY, (bounds.y + bounds.height) * scale + ty);
      });

      const padding = 12;

      // 그룹 바운딩 박스 추가
      this.svg
        .append("rect")
        .attr("class", "group-bounds")
        .attr("x", minX - padding)
        .attr("y", minY - padding)
        .attr("width", maxX - minX + padding * 2)
        .attr("height", maxY - minY + padding * 2);
    }
  }

  clearAll() {
    // 모든 스탬프와 펜 패스 삭제
    this.mainLayer.selectAll(".stamp, .pen-path").remove();

    // 선택 상태 초기화
    this.selectedElements.clear();
    this.svg.selectAll(".group-bounds").remove();
  }
}
