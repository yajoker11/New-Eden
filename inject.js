// inject.js — 注入 iframe 并桥接 MVU 变量
(function () {
  const PANEL_URL = 'https://yajoker11.github.io/New-Eden/';
  const IFRAME_ID = 'eden-status-iframe';

  // 防止重复注入
  if (document.getElementById(IFRAME_ID)) return;

  /* ── 创建 iframe ── */
  const iframe = document.createElement('iframe');
  iframe.id = IFRAME_ID;
  iframe.src = PANEL_URL;
  iframe.allow = '';
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '480px',   // 足够容纳面板+按钮
    height: '100vh',
    border: 'none',
    background: 'transparent',
    zIndex: '2147482999',
    pointerEvents: 'none',   // 默认穿透，按钮区域由 iframe 内部自己处理
  });
  // 允许 iframe 内部点击事件穿透到按钮
  iframe.addEventListener('load', () => {
    iframe.style.pointerEvents = 'auto';
  });
  document.body.appendChild(iframe);

  /* ── 读取 MVU 当前变量 ── */
  function getVariables() {
    try {
      // ST 标准 API
      const ctx = window.SillyTavern?.getContext?.();
      if (ctx?.chatMetadata?.variables) {
        return ctx.chatMetadata.variables;
      }
    } catch (_) {}
    return null;
  }

  /* ── 推送数据给 iframe ── */
  function pushToFrame(vars) {
    if (!vars) return;
    iframe.contentWindow?.postMessage(
      { type: 'eden_status_update', payload: vars },
      'https://yajoker11.github.io'
    );
  }

  /* ── 监听 MVU 的变量更新事件 ── */
  // MVU 在处理完变量后会触发这个自定义事件
  document.addEventListener('mvu:variables-updated', (e) => {
    const vars = e.detail ?? getVariables();
    pushToFrame(vars);
  });

  // 兼容：ST 渲染新消息后也尝试同步一次
  document.addEventListener('sillytavern:chat:rendered', () => {
    pushToFrame(getVariables());
  });

  // 兼容：消息流式输出完成
  document.addEventListener('generation_ended', () => {
    pushToFrame(getVariables());
  });

  // 兜底：iframe 加载完成后推送一次当前数据
  iframe.addEventListener('load', () => {
    setTimeout(() => pushToFrame(getVariables()), 300);
  });
})();
