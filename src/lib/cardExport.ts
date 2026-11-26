import { getInitials } from '../data/presets';
import type { PortfolioData } from '../types/portfolio';
import {
  CARD_CORNER_OPTIONS,
  hexWithAlpha,
  resolveBusinessCardModel,
  type ResolvedBusinessCardModel,
} from './cardEngine';
import { generateQrDataUrl, triggerDownloadBlob } from './exportUtils';
import { escapeHtml, sanitizeFilenamePart } from './sanitize';

const FONT_FAMILY = "'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif";

function getCardPixelDims(orientation: 'landscape' | 'portrait'): { w: number; h: number } {
  // Exact 85:55 ratio (~300 DPI physical business card size: 85mm x 55mm)
  return orientation === 'portrait' ? { w: 660, h: 1020 } : { w: 1020, h: 660 };
}

function getCornerRadiusPx(cornerStyle: ResolvedBusinessCardModel['config']['cornerStyle']): number {
  const found = CARD_CORNER_OPTIONS.find((c) => c.id === cornerStyle);
  return found ? found.radiusPx * 2 : 28;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function measureLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
    } else {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  } else if (lines.length === maxLines && current) {
    let last = lines[maxLines - 1] ?? '';
    while (last.length > 4 && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1).trim();
    }
    if (ctx.measureText(clean).width > maxWidth * maxLines) {
      lines[maxLines - 1] = `${last}...`;
    }
  }
  return lines;
}

function drawTextLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number
): number {
  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawSurfacePattern(
  ctx: CanvasRenderingContext2D,
  model: ResolvedBusinessCardModel,
  w: number,
  h: number
): void {
  const { pattern } = model.config;
  if (pattern === 'none') return;

  ctx.save();
  const stroke = hexWithAlpha(model.effectiveText, model.isLightBg ? 0.06 : 0.08);
  const accentStroke = hexWithAlpha(model.effectiveAccent, model.isLightBg ? 0.12 : 0.22);

  if (pattern === 'dots') {
    ctx.fillStyle = stroke;
    for (let x = 28; x < w; x += 36) {
      for (let y = 28; y < h; y += 36) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'grid') {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    for (let x = 44; x < w; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 44; y < h; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  } else if (pattern === 'waves') {
    ctx.strokeStyle = accentStroke;
    ctx.lineWidth = 2;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(0, h, 140 + i * 75, -Math.PI / 2, 0);
      ctx.stroke();
    }
  } else if (pattern === 'circuit') {
    ctx.strokeStyle = accentStroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 60);
    ctx.lineTo(130, 60);
    ctx.lineTo(170, 100);
    ctx.lineTo(250, 100);
    ctx.moveTo(w - 40, h - 70);
    ctx.lineTo(w - 150, h - 70);
    ctx.lineTo(w - 190, h - 110);
    ctx.stroke();
    ctx.fillStyle = accentStroke;
    const nodes: readonly [number, number][] = [
      [130, 60],
      [250, 100],
      [w - 190, h - 110],
    ];
    for (const [cx, cy] of nodes) {
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawTemplateBackground(
  ctx: CanvasRenderingContext2D,
  model: ResolvedBusinessCardModel,
  w: number,
  h: number
): void {
  const { template } = model.config;
  if (template === 'creative_mesh') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, model.effectiveBg);
    grad.addColorStop(1, model.effectiveAccent);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.fillStyle = hexWithAlpha('#FFFFFF', 0.08);
    ctx.beginPath();
    ctx.arc(w * 0.14, h * 0.85, Math.min(w, h) * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = model.effectiveBg;
    ctx.fillRect(0, 0, w, h);
  }

  drawSurfacePattern(ctx, model, w, h);

  if (template === 'modern_split') {
    // RTL accent strip on the right edge
    ctx.fillStyle = model.effectiveAccent;
    ctx.fillRect(w - 18, 0, 18, h);
  } else if (template === 'minimal_swiss') {
    ctx.fillStyle = model.effectiveAccent;
    ctx.fillRect(0, 0, w, 12);
  } else if (template === 'executive_dark') {
    ctx.save();
    ctx.strokeStyle = hexWithAlpha(model.effectiveAccent, 0.7);
    ctx.lineWidth = 3;
    roundedRectPath(ctx, 18, 18, w - 36, h - 36, 18);
    ctx.stroke();
    ctx.restore();
  }
}

function drawAvatarOrBadge(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  model: ResolvedBusinessCardModel,
  x: number,
  y: number,
  size: number
): void {
  const { avatarMode } = model.config;
  if (avatarMode === 'none') return;

  ctx.save();
  roundedRectPath(ctx, x, y, size, size, 20);
  ctx.fillStyle = hexWithAlpha(model.effectiveAccent, model.isLightBg ? 0.14 : 0.28);
  ctx.fill();
  ctx.strokeStyle = hexWithAlpha(model.effectiveAccent, 0.65);
  ctx.lineWidth = 3;
  ctx.stroke();

  if (img && (avatarMode === 'profile' || avatarMode === 'custom_logo')) {
    ctx.save();
    roundedRectPath(ctx, x + 2, y + 2, size - 4, size - 4, 18);
    ctx.clip();
    const scale = Math.max(size / img.width, size / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, x + (size - dw) / 2, y + (size - dh) / 2, dw, dh);
    ctx.restore();
  } else {
    ctx.fillStyle = model.isLightBg ? model.effectiveAccent : '#FFFFFF';
    ctx.font = `700 ${Math.round(size * 0.38)}px ${FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(model.initials, x + size / 2, y + size / 2 + 2);
  }
  ctx.restore();
}

function drawQrBox(
  ctx: CanvasRenderingContext2D,
  qrImg: HTMLImageElement | null,
  model: ResolvedBusinessCardModel,
  x: number,
  y: number,
  boxSize: number,
  showCaption: boolean
): void {
  if (!qrImg) return;
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  roundedRectPath(ctx, x, y, boxSize, boxSize, 18);
  ctx.fill();
  ctx.strokeStyle = hexWithAlpha(model.effectiveText, 0.18);
  ctx.lineWidth = 2;
  ctx.stroke();

  const pad = Math.round(boxSize * 0.08);
  ctx.drawImage(qrImg, x + pad, y + pad, boxSize - pad * 2, boxSize - pad * 2);

  if (showCaption) {
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = model.secondaryText;
    ctx.font = `600 18px ${FONT_FAMILY}`;
    ctx.fillText(model.qrLabel.slice(0, 32), x + boxSize / 2, y + boxSize + 10, boxSize + 40);
  }
  ctx.restore();
}

/**
 * Renders either side ('front' | 'back') of the customized business card onto an offscreen
 * high-resolution Canvas (~300 DPI for physical printing).
 */
export async function renderCardSideToCanvas(
  data: PortfolioData,
  side: 'front' | 'back'
): Promise<HTMLCanvasElement> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed cleanly with system fallback
    }
  }

  const model = resolveBusinessCardModel(data);
  const { orientation, fontScale, cornerStyle, qrPlacement } = model.config;
  const { w, h } = getCardPixelDims(orientation);
  const scaleMul = fontScale === 'compact' ? 0.9 : fontScale === 'bold' ? 1.12 : 1;

  const showQrOnFront = qrPlacement === 'front' || qrPlacement === 'both';
  const showQrOnBack = qrPlacement === 'back' || qrPlacement === 'both';

  const qrUrl = await generateQrDataUrl(model.qrPayload, 380);
  const [avatarImg, qrImg] = await Promise.all([
    loadImage(model.avatarSrc),
    loadImage(qrUrl),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('المتصفح لا يدعم تصدير الصور عبر Canvas.');
  }

  const r = getCornerRadiusPx(cornerStyle);
  ctx.save();
  roundedRectPath(ctx, 0, 0, w, h, r);
  ctx.clip();

  drawTemplateBackground(ctx, model, w, h);

  const pad = orientation === 'portrait' ? 48 : 56;

  if (side === 'front') {
    const rightAnchor = w - pad - (model.config.template === 'modern_split' ? 14 : 0);
    const avatarSize = orientation === 'portrait' ? 92 : 104;
    const hasAvatar = model.config.avatarMode !== 'none';

    if (orientation === 'landscape') {
      const qrBoxSize = showQrOnFront ? 174 : 0;
      const qrAreaX = pad;
      const contentMaxWidth = showQrOnFront ? w - pad * 2 - qrBoxSize - 38 : w - pad * 2 - 20;

      if (hasAvatar) {
        drawAvatarOrBadge(ctx, avatarImg, model, rightAnchor - avatarSize, pad, avatarSize);
      }

      const textRightX = hasAvatar ? rightAnchor - avatarSize - 24 : rightAnchor;
      const headerWidth = contentMaxWidth - (hasAvatar ? avatarSize + 24 : 0);

      let cursorY = pad;
      if (model.companyOrBrand) {
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillStyle = model.effectiveAccent;
        ctx.font = `700 ${Math.round(22 * scaleMul)}px ${FONT_FAMILY}`;
        ctx.fillText(model.companyOrBrand, textRightX, cursorY, headerWidth);
        cursorY += 32;
      }

      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillStyle = model.effectiveText;
      ctx.font = `700 ${Math.round(42 * scaleMul)}px ${FONT_FAMILY}`;
      ctx.fillText(model.fullName || 'الاسم الكامل', textRightX, cursorY, headerWidth);
      cursorY += Math.round(52 * scaleMul);

      if (model.jobTitle) {
        ctx.fillStyle = model.secondaryText;
        ctx.font = `600 ${Math.round(24 * scaleMul)}px ${FONT_FAMILY}`;
        const jobLines = measureLines(ctx, model.jobTitle, headerWidth, 2);
        cursorY = drawTextLines(ctx, jobLines, textRightX, cursorY, 32);
      }

      const headerBottom = Math.max(cursorY, hasAvatar ? pad + avatarSize + 18 : cursorY + 14);
      let bodyY = headerBottom + 16;

      if (model.tagline) {
        ctx.fillStyle = model.mutedText;
        ctx.font = `500 ${Math.round(21 * scaleMul)}px ${FONT_FAMILY}`;
        const tagLines = measureLines(ctx, model.tagline, contentMaxWidth, 2);
        bodyY = drawTextLines(ctx, tagLines, rightAnchor, bodyY, 30) + 12;
      }

      if (model.availabilityBadge) {
        ctx.save();
        ctx.font = `700 18px ${FONT_FAMILY}`;
        const bw = ctx.measureText(model.availabilityBadge).width + 36;
        roundedRectPath(ctx, rightAnchor - bw, bodyY, bw, 34, 17);
        ctx.fillStyle = model.surfaceTint;
        ctx.fill();
        ctx.fillStyle = model.isLightBg ? model.effectiveAccent : model.effectiveText;
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(model.availabilityBadge, rightAnchor - 18, bodyY + 17);
        ctx.restore();
      }

      if (showQrOnFront && qrImg) {
        drawQrBox(ctx, qrImg, model, qrAreaX, h - pad - qrBoxSize - 26, qrBoxSize, true);
      }

      // Bottom contact strip
      const contactYStart = h - pad - 110;
      ctx.strokeStyle = model.borderColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(showQrOnFront ? qrAreaX + qrBoxSize + 28 : pad, contactYStart - 16);
      ctx.lineTo(rightAnchor, contactYStart - 16);
      ctx.stroke();

      const contactRows = [
        model.phone ? { text: model.phone, ltr: true } : null,
        model.email ? { text: model.email, ltr: true } : null,
        model.website ? { text: model.website.replace(/^https?:\/\//i, ''), ltr: true } : null,
        model.city ? { text: model.city, ltr: false } : null,
      ].filter((x): x is { text: string; ltr: boolean } => Boolean(x));

      let cy = contactYStart;
      ctx.font = `500 ${Math.round(20 * scaleMul)}px ${FONT_FAMILY}`;
      for (const row of contactRows.slice(0, 4)) {
        ctx.fillStyle = model.secondaryText;
        ctx.direction = row.ltr ? 'ltr' : 'rtl';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(row.text, rightAnchor, cy, contentMaxWidth);
        cy += 28;
      }
    } else {
      // Portrait front layout
      let cursorY = pad;
      if (hasAvatar) {
        drawAvatarOrBadge(ctx, avatarImg, model, rightAnchor - avatarSize, cursorY, avatarSize);
        cursorY += avatarSize + 22;
      }

      if (model.companyOrBrand) {
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillStyle = model.effectiveAccent;
        ctx.font = `700 ${Math.round(21 * scaleMul)}px ${FONT_FAMILY}`;
        ctx.fillText(model.companyOrBrand, rightAnchor, cursorY, w - pad * 2);
        cursorY += 32;
      }

      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillStyle = model.effectiveText;
      ctx.font = `700 ${Math.round(38 * scaleMul)}px ${FONT_FAMILY}`;
      const nameLines = measureLines(ctx, model.fullName || 'الاسم الكامل', w - pad * 2, 2);
      cursorY = drawTextLines(ctx, nameLines, rightAnchor, cursorY, 46);

      if (model.jobTitle) {
        ctx.fillStyle = model.secondaryText;
        ctx.font = `600 ${Math.round(22 * scaleMul)}px ${FONT_FAMILY}`;
        const jobLines = measureLines(ctx, model.jobTitle, w - pad * 2, 2);
        cursorY = drawTextLines(ctx, jobLines, rightAnchor, cursorY + 4, 30);
      }

      if (model.tagline) {
        ctx.fillStyle = model.mutedText;
        ctx.font = `500 ${Math.round(20 * scaleMul)}px ${FONT_FAMILY}`;
        const tagLines = measureLines(ctx, model.tagline, w - pad * 2, 2);
        cursorY = drawTextLines(ctx, tagLines, rightAnchor, cursorY + 14, 28);
      }

      if (showQrOnFront && qrImg) {
        const qrSize = 210;
        drawQrBox(ctx, qrImg, model, (w - qrSize) / 2, h - pad - qrSize - 170, qrSize, true);
      }

      const contactRows = [
        model.phone ? { text: model.phone, ltr: true } : null,
        model.email ? { text: model.email, ltr: true } : null,
        model.city ? { text: model.city, ltr: false } : null,
        model.website ? { text: model.website.replace(/^https?:\/\//i, ''), ltr: true } : null,
      ].filter((x): x is { text: string; ltr: boolean } => Boolean(x));

      let cy = h - pad - contactRows.slice(0, 4).length * 30;
      ctx.font = `500 ${Math.round(20 * scaleMul)}px ${FONT_FAMILY}`;
      for (const row of contactRows.slice(0, 4)) {
        ctx.fillStyle = model.secondaryText;
        ctx.direction = row.ltr ? 'ltr' : 'rtl';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(row.text, rightAnchor, cy, w - pad * 2);
        cy += 30;
      }
    }
  } else {
    // Back face
    const centerX = w / 2;
    const rightAnchor = w - pad;

    if (orientation === 'landscape') {
      const qrSize = showQrOnBack ? 240 : 0;
      if (showQrOnBack && qrImg) {
        drawQrBox(ctx, qrImg, model, pad + 8, (h - qrSize - 30) / 2, qrSize, true);
      }

      const infoX = rightAnchor;
      const infoWidth = showQrOnBack ? w - pad * 2 - qrSize - 46 : w - pad * 2;
      let y = pad + 26;

      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillStyle = model.effectiveAccent;
      ctx.font = `700 20px ${FONT_FAMILY}`;
      ctx.fillText(model.companyOrBrand || 'بصمة • الملف المهني', infoX, y, infoWidth);
      y += 38;

      ctx.fillStyle = model.effectiveText;
      ctx.font = `700 ${Math.round(34 * scaleMul)}px ${FONT_FAMILY}`;
      ctx.fillText(model.fullName || 'الاسم الكامل', infoX, y, infoWidth);
      y += 48;

      if (model.backNote || model.tagline) {
        ctx.fillStyle = model.secondaryText;
        ctx.font = `500 21px ${FONT_FAMILY}`;
        const lines = measureLines(ctx, model.backNote || model.tagline, infoWidth, 3);
        y = drawTextLines(ctx, lines, infoX, y, 30) + 18;
      }

      if (model.skillsTop4.length > 0) {
        ctx.font = `600 17px ${FONT_FAMILY}`;
        let pillRight = infoX;
        let pillY = y + 8;
        for (const sk of model.skillsTop4) {
          const textW = Math.min(infoWidth - 20, ctx.measureText(sk).width + 28);
          if (pillRight - textW < (showQrOnBack ? pad + qrSize + 36 : pad)) {
            pillRight = infoX;
            pillY += 42;
          }
          ctx.save();
          roundedRectPath(ctx, pillRight - textW, pillY, textW, 34, 10);
          ctx.fillStyle = model.surfaceTint;
          ctx.fill();
          ctx.strokeStyle = hexWithAlpha(model.effectiveAccent, 0.45);
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = model.isLightBg ? model.effectiveText : '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sk, pillRight - textW / 2, pillY + 17, textW - 14);
          ctx.restore();
          pillRight -= textW + 10;
        }
      }

      if (model.website) {
        ctx.fillStyle = model.mutedText;
        ctx.direction = 'ltr';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.font = `500 18px ${FONT_FAMILY}`;
        ctx.fillText(model.website.replace(/^https?:\/\//i, ''), infoX, h - pad);
      }
    } else {
      // Portrait back layout
      let y = pad + 18;
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = model.effectiveText;
      ctx.font = `700 ${Math.round(32 * scaleMul)}px ${FONT_FAMILY}`;
      ctx.fillText(model.fullName || 'الاسم الكامل', centerX, y, w - pad * 2);
      y += 44;

      if (model.jobTitle) {
        ctx.fillStyle = model.secondaryText;
        ctx.font = `600 20px ${FONT_FAMILY}`;
        ctx.fillText(model.jobTitle, centerX, y, w - pad * 2);
        y += 40;
      }

      if (showQrOnBack && qrImg) {
        const qrSize = 270;
        drawQrBox(ctx, qrImg, model, (w - qrSize) / 2, y + 36, qrSize, true);
        y += qrSize + 96;
      }

      if (model.backNote || model.tagline) {
        ctx.fillStyle = model.mutedText;
        ctx.font = `500 19px ${FONT_FAMILY}`;
        const lines = measureLines(ctx, model.backNote || model.tagline, w - pad * 2, 3);
        drawTextLines(ctx, lines, centerX, y + 18, 28);
      }
    }
  }

  ctx.restore();
  return canvas;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('تعذّر تحويل الكارت إلى صورة PNG.'));
    }, 'image/png');
  });
}

export async function downloadCardPng(
  data: PortfolioData,
  mode: 'front' | 'back' | 'both'
): Promise<void> {
  const model = resolveBusinessCardModel(data);
  const slug = sanitizeFilenamePart(model.fullName || data.profile.fullName);

  if (mode === 'front' || mode === 'back') {
    const canvas = await renderCardSideToCanvas(data, mode);
    const blob = await canvasToPngBlob(canvas);
    triggerDownloadBlob(`basma-card-${slug}-${mode}.png`, blob, 'image/png');
    return;
  }

  const [frontCanvas, backCanvas] = await Promise.all([
    renderCardSideToCanvas(data, 'front'),
    renderCardSideToCanvas(data, 'back'),
  ]);

  const gap = 48;
  const margin = 64;
  const combined = document.createElement('canvas');
  if (model.config.orientation === 'landscape') {
    combined.width = frontCanvas.width + margin * 2;
    combined.height = frontCanvas.height * 2 + gap + margin * 2;
  } else {
    combined.width = frontCanvas.width * 2 + gap + margin * 2;
    combined.height = frontCanvas.height + margin * 2;
  }

  const ctx = combined.getContext('2d');
  if (!ctx) throw new Error('تعذّر تجميع وجهي الكارت.');

  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, 0, combined.width, combined.height);
  ctx.drawImage(frontCanvas, margin, margin);
  if (model.config.orientation === 'landscape') {
    ctx.drawImage(backCanvas, margin, margin + frontCanvas.height + gap);
  } else {
    ctx.drawImage(backCanvas, margin + frontCanvas.width + gap, margin);
  }

  const blob = await canvasToPngBlob(combined);
  triggerDownloadBlob(`basma-card-${slug}-front-back.png`, blob, 'image/png');
}

/**
 * Generates an interactive offline HTML business card with front/back flip + embedded vCard button.
 */
export function buildStandaloneInteractiveCardHtml(
  data: PortfolioData,
  qrDataUrl: string
): string {
  const model = resolveBusinessCardModel(data);
  const title = escapeHtml(model.fullName || 'بطاقة تواصل');
  const job = escapeHtml(model.jobTitle);
  const brand = escapeHtml(model.companyOrBrand);
  const tagline = escapeHtml(model.tagline);
  const initials = escapeHtml(model.initials || getInitials(model.fullName));
  const safeAvatar = escapeHtml(model.avatarSrc);
  const safeQr = escapeHtml(qrDataUrl);
  const safeVcardJson = JSON.stringify(model.vcardPayload).replace(/</g, '\\u003c');
  const safeFileSlug = sanitizeFilenamePart(model.fullName || data.profile.fullName);

  const ratioStyle =
    model.config.orientation === 'portrait'
      ? 'width: 340px; min-height: 525px;'
      : 'width: 100%; max-width: 520px; min-height: 320px;';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — كارت بصمة الرقمي</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
      background: #F1F5F9;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      gap: 18px;
    }
    .stage { ${ratioStyle} perspective: 1200px; }
    .card {
      position: relative;
      border-radius: 18px;
      background: ${model.config.template === 'creative_mesh'
        ? `linear-gradient(135deg, ${model.effectiveBg} 0%, ${model.effectiveAccent} 100%)`
        : model.effectiveBg};
      color: ${model.effectiveText};
      padding: 28px;
      box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.25);
      border: 1px solid ${model.borderColor};
      overflow: hidden;
    }
    .stripe {
      position: absolute;
      top: 0; bottom: 0; right: 0;
      width: 7px;
      background: ${model.effectiveAccent};
    }
    .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .avatar {
      width: 64px; height: 64px; border-radius: 16px; overflow: hidden;
      background: ${model.surfaceTint}; border: 2px solid ${model.effectiveAccent};
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; flex-shrink: 0;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    h1 { margin: 4px 0 0; font-size: 22px; }
    .job { margin: 4px 0 0; font-size: 13px; color: ${model.secondaryText}; }
    .tagline { margin: 12px 0 0; font-size: 12.5px; color: ${model.mutedText}; }
    .brand { font-size: 12px; font-weight: 700; color: ${model.effectiveAccent}; }
    .contacts {
      margin-top: 20px; padding-top: 14px; border-top: 1px solid ${model.borderColor};
      display: grid; gap: 6px; font-size: 13px; color: ${model.secondaryText};
    }
    .qr-panel { display: none; text-align: center; }
    .is-back .front-view { display: none; }
    .is-back .qr-panel { display: block; }
    .qr-box {
      display: inline-block; background: #FFF; padding: 10px; border-radius: 14px; margin: 8px auto;
    }
    .qr-box img { width: 156px; height: 156px; display: block; }
    .skills { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 12px; }
    .skill { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; background: ${model.surfaceTint}; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    button {
      font-family: inherit; cursor: pointer; border-radius: 12px; border: 1px solid #CBD5E1;
      padding: 10px 16px; font-size: 13px; font-weight: 700; background: #FFF; color: #0F172A;
    }
    button.primary { background: ${model.effectiveAccent}; color: #FFF; border-color: transparent; }
  </style>
</head>
<body>
  <div class="stage">
    <article id="cardBox" class="card">
      ${model.config.template === 'modern_split' ? '<div class="stripe"></div>' : ''}
      <div class="front-view">
        <div class="row">
          <div>
            ${brand ? `<div class="brand">${brand}</div>` : ''}
            <h1>${title}</h1>
            ${job ? `<p class="job">${job}</p>` : ''}
          </div>
          ${
            model.config.avatarMode !== 'none'
              ? `<div class="avatar">${
                  safeAvatar ? `<img src="${safeAvatar}" alt="${title}" />` : initials
                }</div>`
              : ''
          }
        </div>
        ${tagline ? `<p class="tagline">${tagline}</p>` : ''}
        <div class="contacts">
          ${model.phone ? `<div dir="ltr" style="text-align:right">${escapeHtml(model.phone)}</div>` : ''}
          ${model.email ? `<div dir="ltr" style="text-align:right">${escapeHtml(model.email)}</div>` : ''}
          ${model.city ? `<div>${escapeHtml(model.city)}</div>` : ''}
          ${model.website ? `<div dir="ltr" style="text-align:right">${escapeHtml(model.website)}</div>` : ''}
        </div>
      </div>
      <div class="qr-panel">
        <div style="font-weight:700;font-size:16px">${title}</div>
        <div class="qr-box"><img src="${safeQr}" alt="QR Code" /></div>
        <div style="font-size:12px;color:${model.secondaryText}">${escapeHtml(model.qrLabel)}</div>
        ${
          model.skillsTop4.length > 0
            ? `<div class="skills">${model.skillsTop4
                .map((s) => `<span class="skill">${escapeHtml(s)}</span>`)
                .join('')}</div>`
            : ''
        }
      </div>
    </article>
  </div>
  <div class="actions">
    <button type="button" onclick="document.getElementById('cardBox').classList.toggle('is-back')">
      قلب الوجه (الأمامي / الخلفي)
    </button>
    <button type="button" class="primary" onclick="downloadVcf()">
      حفظ جهة الاتصال (.vcf)
    </button>
  </div>
  <script>
    var vcardContent = ${safeVcardJson};
    function downloadVcf() {
      var blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '${escapeHtml(safeFileSlug)}.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    }
  </script>
</body>
</html>`;
}

export async function downloadStandaloneInteractiveCardHtml(data: PortfolioData): Promise<void> {
  const model = resolveBusinessCardModel(data);
  const qrUrl = await generateQrDataUrl(model.qrPayload, 280);
  const html = buildStandaloneInteractiveCardHtml(data, qrUrl);
  const slug = sanitizeFilenamePart(model.fullName || data.profile.fullName);
  triggerDownloadBlob(`basma-interactive-card-${slug}.html`, html, 'text/html;charset=utf-8');
}

export async function downloadCardQrPng(data: PortfolioData): Promise<void> {
  const model = resolveBusinessCardModel(data);
  const dataUrl = await generateQrDataUrl(model.qrPayload, 512);
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const slug = sanitizeFilenamePart(model.fullName || data.profile.fullName);
  triggerDownloadBlob(`basma-card-qr-${slug}.png`, blob, 'image/png');
}

export function downloadCardVcf(data: PortfolioData): void {
  const model = resolveBusinessCardModel(data);
  const slug = sanitizeFilenamePart(model.fullName || data.profile.fullName);
  triggerDownloadBlob(`basma-card-${slug}.vcf`, model.vcardPayload, 'text/vcard;charset=utf-8');
}
