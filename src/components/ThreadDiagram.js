import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Rect, Circle } from 'react-native-svg';

export default function ThreadDiagram({ odOrId, majorD, minorD, pitch, threadHeight, width = 300, height = 210 }) {
  if (!majorD && !minorD) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#888', fontSize: 12 }}>Masukkan data ulir</Text>
      </View>
    );
  }

  const cy = height / 2 + 10;
  const padL = 80;
  const padR = 20;
  const drawW = width - padL - padR;
  const scale = Math.min(threadHeight ? 35 / (threadHeight * 20) : 1, 1);
  const majorR = 30 * scale;
  const minorR = majorR - Math.min(threadHeight * 15 * scale, 20);
  const teeth = 5;
  const toothW = drawW / teeth;

  const threadPaths = [];
  for (let i = 0; i < teeth; i++) {
    const x = padL + i * toothW;
    const t = odOrId === 'OD' ? cy - majorR : cy + majorR;
    const r = odOrId === 'OD' ? cy - minorR : cy + minorR;
    const d = odOrId === 'OD' ? -1 : 1;
    const hw = toothW * 0.35;
    threadPaths.push(`${x},${r} L${x + hw},${t} L${x + hw * 2},${r}`);
  }

  const centerX = padL + drawW / 2;
  const labelX = 4;
  const labelW = padL - 12;

  const C_MAJOR = '#4CAF50';
  const C_MINOR = '#FF9800';
  const C_PITCH = '#2196F3';
  const C_HEIGHT = '#E91E63';
  const C_DIM = '#888';

  return (
    <View style={{ alignItems: 'center', paddingVertical: 6 }}>
      <Svg width={width} height={height}>
        {/* Center axis */}
        <Line x1={padL} y1={cy} x2={width - padR} y2={cy} stroke="#555" strokeWidth={0.8} strokeDasharray="6,3" />

        {/* Solid body background */}
        {odOrId === 'OD' ? (
          <Rect x={padL} y={cy} width={drawW} height={2} fill="#666" />
        ) : (
          <Rect x={padL} y={cy - 2} width={drawW} height={2} fill="#666" />
        )}

        {/* Thread profile */}
        <Path
          d={`M ${padL},${odOrId === 'OD' ? cy - minorR : cy + minorR} ${threadPaths.join(' ')} L ${padL + drawW},${odOrId === 'OD' ? cy - minorR : cy + minorR}`}
          fill="none" stroke={C_MAJOR} strokeWidth={1.8}
        />

        {/* Minor diameter reference line (dashed) */}
        <Line x1={padL} y1={odOrId === 'OD' ? cy - minorR : cy + minorR} x2={padL + drawW} y2={odOrId === 'OD' ? cy - minorR : cy + minorR} stroke={C_MINOR} strokeWidth={0.8} strokeDasharray="4,3" />

        {/* ===== DIMENSION: Major Diameter (left side) ===== */}
        <Line x1={padL} y1={odOrId === 'OD' ? cy - majorR - 6 : cy + majorR + 6} x2={padL} y2={odOrId === 'OD' ? cy - majorR : cy + majorR} stroke={C_MAJOR} strokeWidth={0.8} />
        <Line x1={padL} y1={odOrId === 'OD' ? cy - majorR - 6 : cy + majorR + 6} x2={padL - 5} y2={odOrId === 'OD' ? cy - majorR - 6 : cy + majorR + 6} stroke={C_MAJOR} strokeWidth={0.8} />
        <Line x1={padL} y1={odOrId === 'OD' ? cy - minorR : cy + minorR} x2={padL - 5} y2={odOrId === 'OD' ? cy - minorR : cy + minorR} stroke={C_MINOR} strokeWidth={0.8} />
        <Line x1={padL - 16} y1={odOrId === 'OD' ? cy - majorR - 6 : cy + majorR + 6} x2={padL - 16} y2={odOrId === 'OD' ? cy - minorR : cy + minorR} stroke={C_HEIGHT} strokeWidth={0.8} />
        <SvgText x={labelX} y={odOrId === 'OD' ? cy - majorR - 1 : cy + majorR + 16} fontSize={13} fontWeight="bold" fill={C_MAJOR}>
          Major Ø {majorD}
        </SvgText>
        <SvgText x={labelX} y={odOrId === 'OD' ? cy - minorR + 4 : cy + minorR - 5} fontSize={13} fontWeight="bold" fill={C_MINOR}>
          Minor Ø {minorD}
        </SvgText>
        <SvgText x={labelX} y={odOrId === 'OD' ? cy - (majorR + minorR) / 2 + 2 : cy + (majorR + minorR) / 2 + 2} fontSize={12} fill={C_HEIGHT}>
          H={threadHeight ? threadHeight.toFixed(3) : '?'}
        </SvgText>

        {/* ===== DIMENSION: Pitch (bottom) ===== */}
        {(() => {
          const pitchY = odOrId === 'OD' ? cy + 20 : cy - 20;
          const p1x = padL + toothW * 0.35;
          const p2x = p1x + toothW;
          return (
            <>
              <Line x1={p1x} y1={odOrId === 'OD' ? cy + 2 : cy - 2} x2={p1x} y2={pitchY} stroke={C_PITCH} strokeWidth={0.8} />
              <Line x1={p2x} y1={odOrId === 'OD' ? cy + 2 : cy - 2} x2={p2x} y2={pitchY} stroke={C_PITCH} strokeWidth={0.8} />
              <Line x1={p1x} y1={pitchY} x2={p2x} y2={pitchY} stroke={C_PITCH} strokeWidth={1.2} />
              <Line x1={p1x} y1={pitchY} x2={p1x + 4} y2={pitchY - 3} stroke={C_PITCH} strokeWidth={0.8} />
              <Line x1={p2x} y1={pitchY} x2={p2x - 4} y2={pitchY - 3} stroke={C_PITCH} strokeWidth={0.8} />
              <SvgText x={(p1x + p2x) / 2 - 10} y={pitchY + (odOrId === 'OD' ? 14 : -4)} fontSize={12} fontWeight="bold" fill={C_PITCH}>
                P={pitch || '?'}
              </SvgText>
            </>
          );
        })()}

        {/* Label: Tipe Ulir */}
        <SvgText x={width - padR - 70} y={odOrId === 'OD' ? 18 : height - 10} fontSize={10} fill="#AAA" fontStyle="italic">
          {odOrId === 'OD' ? 'ULIR LUAR (OD)' : 'ULIR DALAM (ID)'}
        </SvgText>
      </Svg>
    </View>
  );
}
