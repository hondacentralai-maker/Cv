import React, { useId } from 'react';
import {
  CARD_CORNER_OPTIONS,
  hexWithAlpha,
  resolveBusinessCardModel,
} from '../../lib/cardEngine';
import type { PortfolioData } from '../../types/portfolio';

interface BusinessCardVisualProps {
  data: PortfolioData;
  side: 'front' | 'back';
  qrDataUrl: string;
  compact?: boolean;
  printPhysical?: boolean;
  className?: string;
}

export const BusinessCardVisual: React.FC<BusinessCardVisualProps> = ({
  data,
  side,
  qrDataUrl,
  compact = false,
  printPhysical = false,
  className = '',
}) => {
  const patternUid = useId().replace(/:/g, '');
  const model = resolveBusinessCardModel(data);
  const { template, orientation, pattern, cornerStyle, fontScale, qrPlacement } = model.config;

  const isPortrait = orientation === 'portrait';
  const showQrOnFront = qrPlacement === 'front' || qrPlacement === 'both';
  const showQrOnBack = qrPlacement === 'back' || qrPlacement === 'both';

  const cornerMeta = CARD_CORNER_OPTIONS.find((c) => c.id === cornerStyle);
  const borderRadius = printPhysical ? '2px' : `${cornerMeta?.radiusPx ?? 14}px`;

  const fontScaleNum =
    (fontScale === 'compact' ? 0.9 : fontScale === 'bold' ? 1.1 : 1) *
    (compact ? 0.94 : 1);

  const backgroundStyle =
    template === 'creative_mesh'
      ? `linear-gradient(135deg, ${model.effectiveBg} 0%, ${model.effectiveAccent} 100%)`
      : template === 'glass_aurora'
      ? `radial-gradient(circle at 84% 18%, ${hexWithAlpha(model.effectiveAccent, 0.72)} 0%, transparent 52%), radial-gradient(circle at 16% 86%, ${hexWithAlpha(model.effectiveAccent, 0.52)} 0%, transparent 48%), ${model.effectiveBg}`
      : model.effectiveBg;

  const isTerminal = template === 'terminal_dev';
  const isGlass = template === 'glass_aurora';
  const isBentoTile = template === 'bento_tile';
  const isEditorial = template === 'editorial_stripe';

  const containerStyle: React.CSSProperties = {
    containerType: 'inline-size',
    aspectRatio: isPortrait ? '55 / 85' : '85 / 55',
    background: backgroundStyle,
    color: model.effectiveText,
    borderRadius: isEditorial && !printPhysical ? '4px' : borderRadius,
    border:
      template === 'executive_dark'
        ? `1.5px solid ${hexWithAlpha(model.effectiveAccent, 0.7)}`
        : isTerminal
        ? '1px solid #30363D'
        : isEditorial
        ? `1.5px solid ${hexWithAlpha(model.effectiveText, 0.35)}`
        : `1px solid ${model.borderColor}`,
    ...(printPhysical
      ? {
          width: isPortrait ? '55mm' : '85mm',
          height: isPortrait ? '85mm' : '55mm',
        }
      : {}),
  };

  const renderSvgPattern = () => {
    if (pattern === 'none') return null;
    const strokeCol = hexWithAlpha(model.effectiveText, model.isLightBg ? 0.08 : 0.1);
    const accentCol = hexWithAlpha(model.effectiveAccent, model.isLightBg ? 0.14 : 0.24);

    if (pattern === 'dots') {
      const pid = `dots-${patternUid}`;
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id={pid} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.2" fill={strokeCol} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${pid})`} />
        </svg>
      );
    }

    if (pattern === 'grid') {
      const pid = `grid-${patternUid}`;
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id={pid} width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M 22 0 L 0 0 0 22" fill="none" stroke={strokeCol} strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${pid})`} />
        </svg>
      );
    }

    if (pattern === 'waves') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 260"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx="10"
              cy="250"
              r={55 + i * 42}
              fill="none"
              stroke={accentCol}
              strokeWidth="1.5"
            />
          ))}
        </svg>
      );
    }

    if (pattern === 'diagonal') {
      const pid = `diag-${patternUid}`;
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id={pid} width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M-4,4 l8,-8 M0,16 l16,-16 M12,20 l8,-8" stroke={strokeCol} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${pid})`} />
        </svg>
      );
    }

    if (pattern === 'topography') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 260"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[0, 26, 52, 78].map((offset) => (
            <path
              key={offset}
              d={`M -20 ${40 + offset} C 85 ${10 + offset}, 170 ${125 + offset}, 280 ${55 + offset} S 390 ${105 + offset}, 430 ${65 + offset}`}
              fill="none"
              stroke={accentCol}
              strokeWidth="1.2"
            />
          ))}
        </svg>
      );
    }

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 16 32 L 78 32 L 104 58 L 160 58 M 384 224 L 310 224 L 284 198"
          fill="none"
          stroke={accentCol}
          strokeWidth="1.6"
        />
        <circle cx="160" cy="58" r="3" fill={accentCol} />
        <circle cx="284" cy="198" r="3" fill={accentCol} />
      </svg>
    );
  };

  const renderAvatar = () => {
    if (model.config.avatarMode === 'none') return null;
    const sizeStyle: React.CSSProperties = {
      width: isPortrait ? '15cqi' : '12.5cqi',
      height: isPortrait ? '15cqi' : '12.5cqi',
      backgroundColor: model.surfaceTint,
      borderColor: hexWithAlpha(model.effectiveAccent, 0.7),
      color: model.isLightBg ? model.effectiveAccent : '#FFFFFF',
      fontSize: isPortrait ? '5.4cqi' : '4.4cqi',
    };

    return (
      <div
        className="rounded-xl border-2 overflow-hidden flex items-center justify-center font-bold shrink-0"
        style={sizeStyle}
      >
        {model.avatarSrc ? (
          <img
            src={model.avatarSrc}
            alt={model.fullName || 'الشعار'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{model.initials}</span>
        )}
      </div>
    );
  };

  const renderQrWidget = (sizeCss: string) => (
    <div className="flex flex-col items-center shrink-0" style={{ gap: '1.2cqi' }}>
      <div
        className="bg-white rounded-lg p-[1.2cqi] shadow-xs flex items-center justify-center border"
        style={{
          width: sizeCss,
          height: sizeCss,
          borderColor: model.borderColor,
        }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={model.qrLabel}
            className="w-full h-full object-contain block"
          />
        ) : (
          <span className="text-[9px] text-slate-400">QR...</span>
        )}
      </div>
      <span
        className="font-semibold text-center leading-tight max-w-full truncate"
        style={{
          color: model.mutedText,
          fontSize: isPortrait ? '2.7cqi' : '2cqi',
        }}
      >
        {model.qrLabel}
      </span>
    </div>
  );

  const contactItems = [
    model.phone ? { key: 'phone', text: model.phone, ltr: true } : null,
    model.email ? { key: 'email', text: model.email, ltr: true } : null,
    model.website
      ? {
          key: 'site',
          text: model.website.replace(/^https?:\/\//i, ''),
          ltr: true,
        }
      : null,
    model.city ? { key: 'city', text: model.city, ltr: false } : null,
  ].filter((x): x is { key: string; text: string; ltr: boolean } => Boolean(x));

  return (
    <article
      dir="rtl"
      className={`relative overflow-hidden select-none shadow-md ${className}`}
      style={containerStyle}
    >
      {renderSvgPattern()}

      {/* Template decorative accents */}
      {template === 'modern_split' && (
        <div
          className="absolute inset-y-0 right-0 pointer-events-none"
          style={{ width: '2.2cqi', backgroundColor: model.effectiveAccent }}
          aria-hidden="true"
        />
      )}
      {template === 'minimal_swiss' && (
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: '1.4cqi', backgroundColor: model.effectiveAccent }}
          aria-hidden="true"
        />
      )}
      {template === 'creative_mesh' && (
        <div
          className="absolute -bottom-[12cqi] -left-[12cqi] rounded-full pointer-events-none"
          style={{
            width: '38cqi',
            height: '38cqi',
            backgroundColor: hexWithAlpha('#FFFFFF', 0.08),
          }}
          aria-hidden="true"
        />
      )}
      {template === 'executive_dark' && (
        <div
          className="absolute inset-[2cqi] rounded-lg pointer-events-none border"
          style={{ borderColor: hexWithAlpha(model.effectiveAccent, 0.45) }}
          aria-hidden="true"
        />
      )}
      {isGlass && (
        <div
          className="absolute inset-[2.6cqi] rounded-2xl pointer-events-none border"
          style={{
            backgroundColor: hexWithAlpha('#FFFFFF', model.isLightBg ? 0.56 : 0.1),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderColor: hexWithAlpha('#FFFFFF', model.isLightBg ? 0.6 : 0.24),
          }}
          aria-hidden="true"
        />
      )}
      {isTerminal && (
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-between px-[3.5cqi] border-b pointer-events-none"
          style={{
            height: isPortrait ? '7.2cqi' : '6.2cqi',
            backgroundColor: hexWithAlpha('#FFFFFF', model.isLightBg ? 0.06 : 0.05),
            borderColor: model.borderColor,
          }}
          aria-hidden="true"
        >
          <div className="flex items-center gap-[1.1cqi]">
            <span className="rounded-full bg-rose-500/85" style={{ width: '1.6cqi', height: '1.6cqi' }} />
            <span className="rounded-full bg-amber-400/85" style={{ width: '1.6cqi', height: '1.6cqi' }} />
            <span className="rounded-full bg-emerald-400/85" style={{ width: '1.6cqi', height: '1.6cqi' }} />
          </div>
          <span
            dir="ltr"
            className="font-mono"
            style={{ fontSize: isPortrait ? '2.4cqi' : '1.8cqi', color: model.mutedText }}
          >
            ~/basma-card.vcf
          </span>
        </div>
      )}
      {isBentoTile && (
        <div
          className="absolute inset-[2.2cqi] rounded-2xl pointer-events-none border"
          style={{
            backgroundColor: hexWithAlpha(model.isLightBg ? '#FFFFFF' : '#FFFFFF', model.isLightBg ? 0.72 : 0.05),
            borderColor: model.borderColor,
          }}
          aria-hidden="true"
        />
      )}
      {isEditorial && (
        <>
          <div
            className="absolute inset-y-0 left-0 pointer-events-none"
            style={{ width: '1.1cqi', backgroundColor: model.effectiveAccent }}
            aria-hidden="true"
          />
          <span
            className="absolute top-[1.5cqi] right-[2cqi] font-mono leading-none pointer-events-none"
            style={{ fontSize: '2.2cqi', color: model.mutedText }}
            aria-hidden="true"
          >
            +
          </span>
          <span
            className="absolute bottom-[1.5cqi] left-[2.5cqi] font-mono leading-none pointer-events-none"
            style={{ fontSize: '2.2cqi', color: model.mutedText }}
            aria-hidden="true"
          >
            +
          </span>
        </>
      )}

      {/* Card Inner Body */}
      <div
        className="relative z-10 h-full w-full flex flex-col justify-between"
        style={{
          padding: isPortrait ? '6.5cqi' : '5.5cqi',
          paddingTop: isTerminal
            ? isPortrait
              ? '10.5cqi'
              : '9.2cqi'
            : isPortrait
            ? '6.5cqi'
            : '5.5cqi',
          paddingRight:
            template === 'modern_split'
              ? isPortrait
                ? '7.5cqi'
                : '7cqi'
              : isPortrait
              ? '6.5cqi'
              : '5.5cqi',
        }}
      >
        {side === 'front' ? (
          <>
            {/* Front Header */}
            <div
              className={`flex ${
                isPortrait ? 'flex-col items-start gap-[2.8cqi]' : 'items-start justify-between gap-[3cqi]'
              }`}
            >
              <div className={`min-w-0 flex-1 ${isPortrait ? 'w-full' : ''}`}>
                {model.companyOrBrand && (
                  <div
                    className="font-bold truncate mb-[0.8cqi]"
                    style={{
                      color:
                        template === 'creative_mesh'
                          ? model.effectiveText
                          : model.effectiveAccent,
                      fontSize: `${(isPortrait ? 3.2 : 2.5) * fontScaleNum}cqi`,
                    }}
                  >
                    {model.companyOrBrand}
                  </div>
                )}

                <h3
                  className="font-bold leading-tight truncate"
                  style={{
                    color: model.effectiveText,
                    fontSize: `${(isPortrait ? 5.6 : 4.5) * fontScaleNum}cqi`,
                  }}
                >
                  {model.fullName || 'الاسم الكامل'}
                </h3>

                {model.jobTitle && (
                  <p
                    className="font-semibold leading-snug mt-[0.8cqi] line-clamp-2"
                    style={{
                      color: model.secondaryText,
                      fontSize: `${(isPortrait ? 3.3 : 2.65) * fontScaleNum}cqi`,
                    }}
                  >
                    {model.jobTitle}
                  </p>
                )}

                {model.tagline && (
                  <p
                    className="mt-[1.6cqi] leading-snug line-clamp-2"
                    style={{
                      color: model.mutedText,
                      fontSize: `${(isPortrait ? 2.9 : 2.2) * fontScaleNum}cqi`,
                    }}
                  >
                    {model.tagline}
                  </p>
                )}

                {model.availabilityBadge && (
                  <div className="mt-[1.8cqi]">
                    <span
                      className="inline-flex items-center gap-[1cqi] rounded-full font-bold px-[2cqi] py-[0.6cqi]"
                      style={{
                        backgroundColor: model.surfaceTint,
                        color: model.isLightBg ? model.effectiveAccent : model.effectiveText,
                        fontSize: `${(isPortrait ? 2.6 : 1.95) * fontScaleNum}cqi`,
                      }}
                    >
                      <span
                        className="rounded-full shrink-0"
                        style={{
                          width: '1.2cqi',
                          height: '1.2cqi',
                          backgroundColor: '#10B981',
                        }}
                      />
                      {model.availabilityBadge}
                    </span>
                  </div>
                )}
              </div>

              {!isPortrait && renderAvatar()}
              {isPortrait && model.config.avatarMode !== 'none' && (
                <div className="order-first">{renderAvatar()}</div>
              )}
            </div>

            {/* Portrait center QR when QR on front */}
            {isPortrait && showQrOnFront && (
              <div className="flex justify-center my-[1.5cqi]">
                {renderQrWidget('32cqi')}
              </div>
            )}

            {/* Front Footer: Contacts + optional Landscape Front QR */}
            <div
              className="flex items-end justify-between gap-[2.5cqi] pt-[2.2cqi] border-t"
              style={{ borderColor: model.borderColor }}
            >
              <div className="space-y-[0.8cqi] min-w-0 flex-1">
                {contactItems.length === 0 ? (
                  <span
                    style={{
                      color: model.mutedText,
                      fontSize: `${(isPortrait ? 2.8 : 2.1) * fontScaleNum}cqi`,
                    }}
                  >
                    فعّل وسيلة تواصل واحدة على الأقل
                  </span>
                ) : (
                  contactItems.slice(0, 4).map((item) => (
                    <div
                      key={item.key}
                      dir={item.ltr ? 'ltr' : 'rtl'}
                      className="truncate text-right font-medium"
                      style={{
                        color: model.secondaryText,
                        fontSize: `${(isPortrait ? 2.95 : 2.25) * fontScaleNum}cqi`,
                      }}
                    >
                      {item.text}
                    </div>
                  ))
                )}
              </div>

              {!isPortrait && showQrOnFront && renderQrWidget('17.5cqi')}
            </div>
          </>
        ) : (
          /* BACK SIDE */
          <div
            className={`h-full flex ${
              isPortrait
                ? 'flex-col items-center justify-between text-center gap-[3cqi]'
                : 'items-center justify-between gap-[4.5cqi]'
            }`}
          >
            <div className={`min-w-0 flex-1 space-y-[2cqi] ${isPortrait ? 'w-full' : ''}`}>
              <div>
                <div
                  className="font-bold truncate"
                  style={{
                    color:
                      template === 'creative_mesh'
                        ? model.effectiveText
                        : model.effectiveAccent,
                    fontSize: `${(isPortrait ? 3.1 : 2.2) * fontScaleNum}cqi`,
                  }}
                >
                  {model.companyOrBrand || 'بصمة • الملف المهني'}
                </div>
                <div
                  className="font-bold truncate mt-[0.5cqi]"
                  style={{
                    color: model.effectiveText,
                    fontSize: `${(isPortrait ? 5.2 : 3.9) * fontScaleNum}cqi`,
                  }}
                >
                  {model.fullName || 'الاسم الكامل'}
                </div>
                {(model.backNote || model.tagline) && (
                  <p
                    className="mt-[1.2cqi] leading-snug line-clamp-3"
                    style={{
                      color: model.secondaryText,
                      fontSize: `${(isPortrait ? 3 : 2.25) * fontScaleNum}cqi`,
                    }}
                  >
                    {model.backNote || model.tagline}
                  </p>
                )}
              </div>

              {model.skillsTop4.length > 0 && (
                <div
                  className={`flex flex-wrap gap-[1.1cqi] ${
                    isPortrait ? 'justify-center' : 'justify-start'
                  }`}
                >
                  {model.skillsTop4.map((sk) => (
                    <span
                      key={sk}
                      className="rounded-md font-semibold px-[1.6cqi] py-[0.5cqi] border"
                      style={{
                        backgroundColor: model.surfaceTint,
                        borderColor: hexWithAlpha(model.effectiveAccent, 0.35),
                        color: model.isLightBg ? model.effectiveText : '#FFFFFF',
                        fontSize: `${(isPortrait ? 2.6 : 1.9) * fontScaleNum}cqi`,
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}

              {model.website && (
                <div
                  dir="ltr"
                  className={`truncate font-medium ${isPortrait ? 'text-center' : 'text-right'}`}
                  style={{
                    color: model.mutedText,
                    fontSize: `${(isPortrait ? 2.6 : 1.95) * fontScaleNum}cqi`,
                  }}
                >
                  {model.website.replace(/^https?:\/\//i, '')}
                </div>
              )}
            </div>

            {showQrOnBack ? (
              renderQrWidget(isPortrait ? '38cqi' : '24cqi')
            ) : (
              !isPortrait && (
                <div
                  className="flex flex-col items-center justify-center rounded-xl border px-[2.4cqi] py-[2cqi] shrink-0"
                  style={{
                    borderColor: model.borderColor,
                    backgroundColor: model.surfaceTint,
                  }}
                >
                  <span
                    className="font-bold"
                    style={{
                      color: model.effectiveText,
                      fontSize: `${3.6 * fontScaleNum}cqi`,
                    }}
                  >
                    {model.initials}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </article>
  );
};
