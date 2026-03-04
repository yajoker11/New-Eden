(function () { if (window !== window.parent) {
    const s = window.parent.document.createElement('script');
    s.type = 'module';
    s.src = 'https://yajoker11.github.io/New-Eden/inject.js?t=' + Date.now();
    window.parent.document.head.appendChild(s);
    return;
  }
  const PANEL_URL = 'https://yajoker11.github.io/New-Eden/';
  const PANEL_URL = 'https://yajoker11.github.io/New-Eden/';
  const IFRAME_ID = 'eden-status-iframe';

  function mount() {
    if (document.getElementById(IFRAME_ID)) return;

    const iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.src = PANEL_URL;
    iframe.setAttribute('aria-hidden', 'true');
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '480px',
      height: '500px',
      border: 'none',
      background: 'transparent',
      zIndex: '2147482999',
      pointerEvents: 'none',
    });
    iframe.addEventListener('load', () => {
      iframe.style.pointerEvents = 'auto';
      setTimeout(() => pushToFrame(getVariables()), 300);
    });
    document.body.appendChild(iframe);
    console.log('[Eden] iframe 已注入');
  }

  function getVariables() {
    try {
      const ctx = window.SillyTavern?.getContext?.();
      if (ctx?.chatMetadata?.variables) return ctx.chatMetadata.variables;
    } catch (_) {}
    return null;
  }

  function pushToFrame(vars) {
    const iframe = document.getElementById(IFRAME_ID);
    if (!vars || !iframe) return;
    iframe.contentWindow?.postMessage(
      { type: 'eden_status_update', payload: vars },
      'https://yajoker11.github.io'
    );
  }

  // 监听 MVU 变量更新
  document.addEventListener('mvu:variables-updated', (e) => {
    pushToFrame(e.detail ?? getVariables());
  });

  // ST 渲染新消息后同步
  document.addEventListener('sillytavern:chat:rendered', () => {
    pushToFrame(getVariables());
  });

  // 切换聊天时清理旧 iframe 并重新注入
  document.addEventListener('sillytavern:chat:changed', () => {
    const old = document.getElementById(IFRAME_ID);
    if (old) old.remove();
    setTimeout(mount, 500);
  });

  // 主入口：等 body 就绪后挂载
  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
