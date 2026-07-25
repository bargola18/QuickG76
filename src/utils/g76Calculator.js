import { formatGCodeNumber } from './formatNumber';

export function formatQNumber(value, machineMode) {
  if (machineMode === 'INTEGER') {
    return Math.round(value * 1000).toString();
  }
  return parseFloat(value.toFixed(4)).toString();
}

export function calculateG76({ thread, machineMode = 'ABSOLUT', zLength, docFirstPass, odOrId = 'OD' }) {
  const pitch = thread.pitchMM || thread.pitch || 0;
  const majorDiameter = thread.majorDiameterMM || thread.majorDiameter || 0;
  const isTapered = thread.taper === true;
  const isSpecialProfile = /^Tr/i.test(thread.designation) || /^Sq/i.test(thread.designation);

  let threadHeight;
  if (isSpecialProfile) {
    threadHeight = 0.5 * pitch;
  } else if (odOrId === 'ID') {
    threadHeight = pitch * 0.5413;
  } else {
    threadHeight = pitch * 0.6134;
  }
  threadHeight = Math.round(threadHeight * 10000) / 10000;

  const dataMinorDiameter = thread.minorDiameterMM || thread.minorDiameter;
  let minorDiameter;
  let xEnd;
  if (odOrId === 'OD') {
    minorDiameter = dataMinorDiameter != null ? dataMinorDiameter : (majorDiameter - 2 * threadHeight);
    xEnd = minorDiameter;
  } else {
    minorDiameter = majorDiameter;
    xEnd = majorDiameter;
  }

  const xStart = odOrId === 'OD' ? majorDiameter + 2 : majorDiameter - 1;
  const zEnd = -Math.abs(zLength);

  const rawQ1 = Math.min(docFirstPass, threadHeight * 0.5);
  let qLine1, qLine2;
  if (machineMode === 'INTEGER') {
    qLine1 = Math.round(rawQ1 * 1000);
    qLine2 = Math.round(docFirstPass * 1000);
  } else {
    qLine1 = Math.round(rawQ1 * 10) / 10;
    qLine2 = docFirstPass;
  }

  let taperR;
  if (isTapered) {
    taperR = (zLength * 0.0625) / 2;
    taperR = Math.round(taperR * 10000) / 10000;
  } else {
    taperR = 0;
  }

  const threadHeightMicrons = Math.round(threadHeight * 1000);
  const docWarning = docFirstPass > 0.8;

  const q1Str = formatQNumber(qLine1, machineMode);
  const q2Str = formatQNumber(qLine2, machineMode);

  const gcodeLine1 = `G76 P030060 Q${q1Str} R0.`;
  const gcodeLine2 = `G76 X${formatGCodeNumber(xEnd)} Z${formatGCodeNumber(zEnd)} P${threadHeightMicrons} Q${q2Str} R${formatGCodeNumber(taperR)} F${formatGCodeNumber(pitch)}`;

  return {
    gcodeLine1,
    gcodeLine2,
    xStart: Math.round(xStart * 1000) / 1000,
    xEnd: Math.round(xEnd * 1000) / 1000,
    threadHeight,
    minorDiameter: Math.round(minorDiameter * 1000) / 1000,
    qLine1,
    qLine2,
    docWarning,
    parameters: {
      designation: thread.designation,
      majorDiameter: Math.round(majorDiameter * 1000) / 1000,
      pitch: Math.round(pitch * 1000) / 1000,
      zLength,
      docFirstPass,
      minorDiameter: Math.round(minorDiameter * 1000) / 1000,
      threadHeight,
    },
  };
}
