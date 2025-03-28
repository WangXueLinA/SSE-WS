const Koa = require('koa');
const path = require("path")
const Router = require('@koa/router');
const cors = require('@koa/cors');
const views = require("koa-views")
const PassThrough = require('stream').PassThrough;

const app = new Koa();
const router = new Router();

app.use(views(path.join(__dirname)))


// 启用CORS
app.use(cors());

// 模拟AI流式响应
function* generateMessages() {
    const chunks = [
        "# 欢迎使用AI助手",
      "以下是一个JavaScript示例：",
      "```javascript",
        "function hello() {",
        "  console.log('Hello World!');",
        "}```",
        "**请享受编程的乐趣！**"
    ];
    
    for (const chunk of chunks) {
        yield chunk;
    }
}

// SSE路由
router.get('/sse', async (ctx) => {
  ctx.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  ctx.status = 200;
  ctx.res.writeHead(200);

    const stream = new PassThrough();
    ctx.body = stream;

    const messages = generateMessages();
    
    const sendChunk = () => {
        const { value, done } = messages.next();
        if (!done) {
            stream.write(`data: ${JSON.stringify(value)}\n\n`);
            setTimeout(sendChunk, 1000);
        } else {
            stream.end();
        }
    };

    sendChunk();

  // 处理连接关闭
  ctx.req.on('close', () => {
    ctx.res.end();
  });
});

router.get("/", async (ctx)=>{
   await ctx.render("index")
})


app.use(router.routes());
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});