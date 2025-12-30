#!/usr/bin/env bun

// 暫時性 HTTP 伺服器，用於接收 OAuth2 callback
const server = Bun.serve({
  port: 8085,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/" && url.search) {
      // 輸出 query string 供 shell script 解析
      console.log(url.search);

      // 關閉伺服器
      setTimeout(() => {
        server.stop();
        process.exit(0);
      }, 100);

      return new Response(
        "<html><body><h1>授權成功！</h1><p>你可以關閉此視窗。</p></body></html>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    return new Response("等待 OAuth2 callback...");
  },
});

// 60 秒超時
setTimeout(() => {
  console.error("超時：未收到授權回調");
  server.stop();
  process.exit(1);
}, 60000);
