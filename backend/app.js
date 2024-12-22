// app.js 또는 index.js
const express = require("express");
const cors = require("cors");
const fs = require("fs").promises; // 파일 시스템 모듈
const path = require("path");
const multer = require("multer");
const app = express();
const upload = multer();

// JSON 파일 경로
const postsPath = "./database/posts/posts.json";

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 요청 타임아웃 설정
app.use((req, res, next) => {
  req.setTimeout(0);
  res.setTimeout(0);
  next();
});

// JSON 파일 읽기 함수
async function readPostsFile() {
  try {
    const data = await fs.readFile(postsPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // 파일이 없으면 빈 배열로 시작
      await fs.writeFile(postsPath, "{}", "utf8");
      return [];
    }
    throw error;
  }
}

// JSON 파일 쓰기 함수
async function writePostsFile(posts) {
  await fs.writeFile(postsPath, JSON.stringify(posts, null, 2), "utf8");
}

// 1. 게시물 작성 API
app.post("/api/posts", upload.none(), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    // 유효성 검사
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "필수 필드가 누락되었습니다.",
      });
    }

    // 기존 게시물 읽기
    const posts = await readPostsFile();

    // 새 게시물 생성
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      category,
      tags: JSON.parse(tags) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: "user-1", // 실제로는 인증된 사용자 ID
        name: "shin-dong-jin", // 실제로는 인증된 사용자 이름
      },
      likes: 0,
      comments: [],
    };

    const id = newPost.id;

    // 새 게시물 추가
    const newPosts = { ...posts, [id]: newPost };

    // 파일에 저장
    await writePostsFile(newPosts);

    // 성공 응답
    res.status(201).json({
      success: true,
      message: "게시물이 성공적으로 작성되었습니다.",
      data: newPost,
    });
  } catch (error) {
    console.error("게시물 작성 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 2. 게시물 목록 조회 API (추가)
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await readPostsFile();
    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("게시물 조회 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 3. 게시물 상세 조회
app.get("/api/posts/:id", async (req, res) => {
  try {
    const posts = await readPostsFile();
    const post = posts[req.params.id];

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("게시물 상세 조회 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 4. 게시물 수정
app.put("/api/posts/:id", upload.none(), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const postId = req.params.id;

    // 기존 게시물 읽기
    const posts = await readPostsFile();
    const post = posts[postId];

    // 게시물이 존재하는지 확인
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    // 게시물 업데이트
    const updatedPost = {
      ...post,
      title: title || post.title,
      content: content || post.content,
      category: category || post.category,
      tags: tags ? JSON.parse(tags) : post.tags,
      updatedAt: new Date().toISOString(),
    };

    // 수정된 게시물 저장
    const updatedPosts = { ...posts, [postId]: updatedPost };
    await writePostsFile(updatedPosts);

    res.json({
      success: true,
      message: "게시물이 성공적으로 수정되었습니다.",
      data: updatedPost,
    });
  } catch (error) {
    console.error("게시물 수정 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 5. 게시물 삭제
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const posts = await readPostsFile();

    // 게시물이 존재하는지 확인
    if (!posts[postId]) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    // 게시물 삭제
    const { [postId]: deletedPost, ...remainingPosts } = posts;
    await writePostsFile(remainingPosts);

    res.json({
      success: true,
      message: "게시물이 성공적으로 삭제되었습니다.",
      data: deletedPost,
    });
  } catch (error) {
    console.error("게시물 삭제 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 댓글 작성 API 수정
app.post("/api/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const posts = await readPostsFile();
    const post = posts[postId];

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    const newComment = {
      id: Date.now().toString(),
      content,
      author: {
        id: "user-1",
        name: "shin-dong-jin",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      replies: [], // replies 배열 초기화 추가
    };

    // comments 배열이 없으면 초기화
    if (!post.comments) {
      post.comments = [];
    }

    post.comments.push(newComment);
    await writePostsFile(posts);

    res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error("댓글 작성 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 댓글 수정 API
app.put("/api/posts/:postId/comments/:commentId", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const posts = await readPostsFile();
    const post = posts[postId];

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    comment.content = content;
    comment.updatedAt = new Date().toISOString();

    await writePostsFile(posts);

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("댓글 수정 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 댓글 삭제 API
app.delete("/api/posts/:postId/comments/:commentId", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const posts = await readPostsFile();
    const post = posts[postId];

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    const commentIndex = post.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    post.comments.splice(commentIndex, 1);
    await writePostsFile(posts);

    res.json({
      success: true,
      message: "댓글이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("댓글 삭제 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 답글 작성 API
app.post("/api/posts/:postId/comments/:commentId/replies", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const posts = await readPostsFile();
    const post = posts[postId];

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    // replies 배열이 없으면 초기화
    if (!comment.replies) {
      comment.replies = [];
    }

    const newReply = {
      id: Date.now().toString(),
      content,
      author: {
        id: "user-1",
        name: "shin-dong-jin",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
    };

    comment.replies.push(newReply);
    await writePostsFile(posts);

    res.status(201).json({
      success: true,
      data: newReply,
    });
  } catch (error) {
    console.error("답글 작성 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 좋아요 API (게시물, 댓글, 답글)
app.post("/api/posts/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const posts = await readPostsFile();
    const post = posts[postId];

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    post.likes += 1;
    await writePostsFile(posts);

    res.json({
      success: true,
      data: { likes: post.likes },
    });
  } catch (error) {
    console.error("좋아요 처리 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 댓글 좋아요 API
app.post("/api/posts/:postId/comments/:commentId/like", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const posts = await readPostsFile();
    const post = posts[postId];

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시물을 찾을 수 없습니다.",
      });
    }

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    comment.likes += 1;
    await writePostsFile(posts);

    res.json({
      success: true,
      data: { likes: comment.likes },
    });
  } catch (error) {
    console.error("댓글 좋아요 처리 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

app.post(
  "/api/posts/:postId/comments/:commentId/replies/:replyId/like",
  async (req, res) => {
    try {
      const { postId, commentId, replyId } = req.params;
      const posts = await readPostsFile();
      const post = posts[postId];

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "게시물을 찾을 수 없습니다.",
        });
      }

      const comment = post.comments.find((c) => c.id === commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "댓글을 찾을 수 없습니다.",
        });
      }

      const reply = comment.replies?.find((r) => r.id === replyId);
      if (!reply) {
        return res.status(404).json({
          success: false,
          message: "답글을 찾을 수 없습니다.",
        });
      }

      reply.likes = (reply.likes || 0) + 1;
      await writePostsFile(posts);

      res.json({
        success: true,
        message: "답글 좋아요가 처리되었습니다.",
      });
    } catch (error) {
      console.error("답글 좋아요 처리 에러:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  }
);

// 답글 수정 API
app.put(
  "/api/posts/:postId/comments/:commentId/replies/:replyId",
  async (req, res) => {
    try {
      const { postId, commentId, replyId } = req.params;
      const { content } = req.body;
      const posts = await readPostsFile();
      const post = posts[postId];

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "게시물을 찾을 수 없습니다.",
        });
      }

      const comment = post.comments.find((c) => c.id === commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "댓글을 찾을 수 없습니다.",
        });
      }

      const reply = comment.replies?.find((r) => r.id === replyId);
      if (!reply) {
        return res.status(404).json({
          success: false,
          message: "답글을 찾을 수 없습니다.",
        });
      }

      reply.content = content;
      reply.updatedAt = new Date().toISOString();
      await writePostsFile(posts);

      res.json({
        success: true,
        data: reply,
      });
    } catch (error) {
      console.error("답글 수정 에러:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  }
);

// 답글 삭제 API
app.delete(
  "/api/posts/:postId/comments/:commentId/replies/:replyId",
  async (req, res) => {
    try {
      const { postId, commentId, replyId } = req.params;
      const posts = await readPostsFile();
      const post = posts[postId];

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "게시물을 찾을 수 없습니다.",
        });
      }

      const comment = post.comments.find((c) => c.id === commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "댓글을 찾을 수 없습니다.",
        });
      }

      const replyIndex = comment.replies?.findIndex((r) => r.id === replyId);
      if (replyIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "답글을 찾을 수 없습니다.",
        });
      }

      comment.replies.splice(replyIndex, 1);
      await writePostsFile(posts);

      res.json({
        success: true,
        message: "답글이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("답글 삭제 에러:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  }
);

app.use("/api/uploads", express.static("database/uploads"));

// SVG 파일 저장
app.post("/api/uploads/svg", async (req, res) => {
  try {
    const svgContent = req.body.svg;
    const fileName = `svg_${Date.now()}.svg`;

    // 절대 경로로 변환
    const filePath = path.join(__dirname, "database", "uploads", fileName);

    // 디렉토리 존재 확인 및 생성
    const dir = path.join(__dirname, "database", "uploads");
    await fs.mkdir(dir, { recursive: true });

    // 파일 저장
    await fs.writeFile(filePath, svgContent);

    // URL 반환
    res.json({ url: `/api/uploads/${fileName}` });
  } catch (error) {
    console.error("Error:", error); // 에러 로깅 추가
    res.status(500).json({ error: "Upload failed" });
  }
});

// png 파일 저장
app.post("/api/uploads/png", async (req, res) => {
  try {
    const pngContent = req.body.png;
    const fileName = `svg_${Date.now()}.png`;

    // 절대 경로로 변환
    const filePath = path.join(__dirname, "database", "uploads", fileName);

    // 디렉토리 존재 확인 및 생성
    const dir = path.join(__dirname, "database", "uploads");
    await fs.mkdir(dir, { recursive: true });

    // 파일 저장
    await fs.writeFile(filePath, pngContent);

    // URL 반환
    res.json({ url: `/api/uploads/${fileName}` });
  } catch (error) {
    console.error("Error:", error); // 에러 로깅 추가
    res.status(500).json({ error: "Upload failed" });
  }
});

// jpg 파일 저장
app.post("/api/uploads/jpg", async (req, res) => {
  try {
    const jpgContent = req.body.jpg;
    const fileName = `svg_${Date.now()}.jpg`;

    // 절대 경로로 변환
    const filePath = path.join(__dirname, "database", "uploads", fileName);

    // 디렉토리 존재 확인 및 생성
    const dir = path.join(__dirname, "database", "uploads");
    await fs.mkdir(dir, { recursive: true });

    // 파일 저장
    await fs.writeFile(filePath, jpgContent);

    // URL 반환
    res.json({ url: `/api/uploads/${fileName}` });
  } catch (error) {
    console.error("Error:", error); // 에러 로깅 추가
    res.status(500).json({ error: "Upload failed" });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
