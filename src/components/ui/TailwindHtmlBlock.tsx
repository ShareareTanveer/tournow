'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

function buildSrcDoc(html: string, frameId: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html, body { margin: 0; padding: 0; background: transparent; overflow-x: hidden; }
      body { font-family: ui-sans-serif, system-ui, sans-serif; }
      img { max-width: 100%; height: auto; display: block; }
    </style>
  </head>
  <body>
    ${html}
    <script>
      (function () {
        const frameId = ${JSON.stringify(frameId)};
        const postHeight = () => {
          const height = Math.max(
            document.documentElement ? document.documentElement.scrollHeight : 0,
            document.body ? document.body.scrollHeight : 0
          );
          window.parent.postMessage({ type: 'tailwind-html-height', frameId, height }, '*');
        };

        const attachImageListeners = () => {
          Array.from(document.images || []).forEach((img) => {
            if (!img.__mvBound) {
              img.addEventListener('load', postHeight);
              img.addEventListener('error', postHeight);
              img.__mvBound = true;
            }
          });
        };

        const observer = new ResizeObserver(postHeight);
        observer.observe(document.documentElement);
        if (document.body) observer.observe(document.body);

        const mutationObserver = new MutationObserver(() => {
          attachImageListeners();
          postHeight();
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true });

        window.addEventListener('load', () => {
          attachImageListeners();
          postHeight();
          setTimeout(postHeight, 150);
          setTimeout(postHeight, 500);
          setTimeout(postHeight, 1200);
        });

        attachImageListeners();
        postHeight();
        setTimeout(postHeight, 0);
      })();
    </script>
  </body>
</html>`
}

export default function TailwindHtmlBlock({
  html,
  className = '',
  minHeight = 260,
}: {
  html: string
  className?: string
  minHeight?: number
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [height, setHeight] = useState(minHeight)
  const frameId = useId()
  const srcDoc = useMemo(() => buildSrcDoc(html, frameId), [html, frameId])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || data.type !== 'tailwind-html-height' || data.frameId !== frameId) return
      setHeight(Math.max(minHeight, Number(data.height) || 0))
    }

    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [frameId, minHeight])

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      title="Tailwind HTML Block"
      scrolling="no"
      className={className}
      style={{ width: '100%', height: `${height}px`, border: 0, background: 'transparent' }}
    />
  )
}
