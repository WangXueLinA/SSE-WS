const Koa = require('koa');
const websocket = require('koa-websocket');
const serve = require('koa-static');
const path = require('path');

const app = websocket(new Koa());

// 存储所有连接的客户端
const clients = new Set();

// 静态文件服务（前端页面）
app.use(serve(path.join(__dirname, 'public')));

// WebSocket 处理
app.ws.use(async (ctx) => {
  // 添加新客户端
  clients.add(ctx.websocket);
  console.log('新的客户端连接，当前连接数:', clients.size);

  // 消息处理
  ctx.websocket.on('message', (message) => {
    const msg = message.toString();
    console.log('收到消息:', msg);
    
    // 广播消息给所有客户端
    clients.forEach(client => {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(msg);
      }
    });
  });

  // 关闭处理
  ctx.websocket.on('close', () => {
    clients.delete(ctx.websocket);
    console.log('客户端断开，剩余连接数:', clients.size);
  });

  // 错误处理
  ctx.websocket.on('error', (err) => {
    console.error('WebSocket 错误:', err);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动，访问地址: http://localhost:${PORT}`);
});