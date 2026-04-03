figma.showUI(__html__, { width: 340, height: 480, title: "VisionLayout AI - 资源定位引擎" });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'final-render') {
    const { config, assets, bgData } = msg;

    try {
      const prevRoot = figma.currentPage.findChild(n => n.name === "AI还原结果");
      if (prevRoot) prevRoot.remove();

      const mainFrame = figma.createFrame();
      mainFrame.name = "AI还原结果";
      mainFrame.resize(config.bw, config.bh);

      const bgImg = figma.createImage(bgData);
      mainFrame.fills = [{
        type: 'IMAGE',
        imageHash: bgImg.hash,
        scaleMode: 'FILL',
        opacity: 0.3
      }];

      const sorted = [...config.list].sort((a, b) => {
        const layerOrderDiff = getLayerOrder(a) - getLayerOrder(b);
        if (layerOrderDiff !== 0) {
          return layerOrderDiff;
        }

        return (b.w * b.h) - (a.w * a.h);
      });

      for (const item of sorted) {
        const rect = figma.createRectangle();
        rect.name = `[Match] ${item.file}`;
        rect.resize(item.w, item.h);
        rect.x = item.x;
        rect.y = item.y;
        const img = figma.createImage(assets[item.file]);
        rect.fills = [{ type: 'IMAGE', imageHash: img.hash, scaleMode: 'FILL' }];
        mainFrame.appendChild(rect);
      }

      figma.currentPage.appendChild(mainFrame);
      figma.viewport.scrollAndZoomIntoView([mainFrame]);
      figma.notify("资源识别完成，位置已还原。");
    } catch (e) {
      figma.notify("错误: " + e.message);
    }
  }
};

function getLayerOrder(item) {
  const hint = item.layerHint || 'content';
  if (hint === 'background') return 0;
  if (hint === 'content') return 1;
  if (hint === 'effect') return 2;
  if (hint === 'foreground') return 3;
  if (hint === 'overlay') return 4;
  return 1;
}
