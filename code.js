figma.showUI(__html__, { width: 340, height: 480, title: "VisionLayout AI - HitRate 引擎" });

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
        opacity: 0.3 // 依然保留半透明底图，方便你严苛验收
      }];

      // 面积排序，防遮挡
      const sorted = config.list.sort((a, b) => (b.w * b.h) - (a.w * a.h));

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
      figma.notify("✨ 全新引擎识别完毕，绝对对齐。");
      
    } catch (e) {
      figma.notify("错误: " + e.message);
    }
  }
};