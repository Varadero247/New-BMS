// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Confidential and proprietary information of Nexara DMCC.

import {
  linear, easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo,
  easeInBack, easeOutBack,
  easeInBounce, easeOutBounce,
  easeInElastic, easeOutElastic,
  lerp, clamp01, pingPong, smoothstep, smootherstep,
  interpolateKeyframes,
  springValue,
  msToFrames, framesToMs, secondsToMs, msToSeconds,
} from '../animation-utils';

describe('linear', () => {
  it('linear(0) === 0', () => {
    expect(linear(0)).toBeCloseTo(0, 5);
  });
  it('linear(0.020408163265) === 0.020408163265', () => {
    expect(linear(0.020408163265)).toBeCloseTo(0.020408163265, 5);
  });
  it('linear(0.040816326531) === 0.040816326531', () => {
    expect(linear(0.040816326531)).toBeCloseTo(0.040816326531, 5);
  });
  it('linear(0.061224489796) === 0.061224489796', () => {
    expect(linear(0.061224489796)).toBeCloseTo(0.061224489796, 5);
  });
  it('linear(0.081632653061) === 0.081632653061', () => {
    expect(linear(0.081632653061)).toBeCloseTo(0.081632653061, 5);
  });
  it('linear(0.102040816327) === 0.102040816327', () => {
    expect(linear(0.102040816327)).toBeCloseTo(0.102040816327, 5);
  });
  it('linear(0.122448979592) === 0.122448979592', () => {
    expect(linear(0.122448979592)).toBeCloseTo(0.122448979592, 5);
  });
  it('linear(0.142857142857) === 0.142857142857', () => {
    expect(linear(0.142857142857)).toBeCloseTo(0.142857142857, 5);
  });
  it('linear(0.163265306122) === 0.163265306122', () => {
    expect(linear(0.163265306122)).toBeCloseTo(0.163265306122, 5);
  });
  it('linear(0.183673469388) === 0.183673469388', () => {
    expect(linear(0.183673469388)).toBeCloseTo(0.183673469388, 5);
  });
  it('linear(0.204081632653) === 0.204081632653', () => {
    expect(linear(0.204081632653)).toBeCloseTo(0.204081632653, 5);
  });
  it('linear(0.224489795918) === 0.224489795918', () => {
    expect(linear(0.224489795918)).toBeCloseTo(0.224489795918, 5);
  });
  it('linear(0.244897959184) === 0.244897959184', () => {
    expect(linear(0.244897959184)).toBeCloseTo(0.244897959184, 5);
  });
  it('linear(0.265306122449) === 0.265306122449', () => {
    expect(linear(0.265306122449)).toBeCloseTo(0.265306122449, 5);
  });
  it('linear(0.285714285714) === 0.285714285714', () => {
    expect(linear(0.285714285714)).toBeCloseTo(0.285714285714, 5);
  });
  it('linear(0.30612244898) === 0.30612244898', () => {
    expect(linear(0.30612244898)).toBeCloseTo(0.30612244898, 5);
  });
  it('linear(0.326530612245) === 0.326530612245', () => {
    expect(linear(0.326530612245)).toBeCloseTo(0.326530612245, 5);
  });
  it('linear(0.34693877551) === 0.34693877551', () => {
    expect(linear(0.34693877551)).toBeCloseTo(0.34693877551, 5);
  });
  it('linear(0.367346938776) === 0.367346938776', () => {
    expect(linear(0.367346938776)).toBeCloseTo(0.367346938776, 5);
  });
  it('linear(0.387755102041) === 0.387755102041', () => {
    expect(linear(0.387755102041)).toBeCloseTo(0.387755102041, 5);
  });
  it('linear(0.408163265306) === 0.408163265306', () => {
    expect(linear(0.408163265306)).toBeCloseTo(0.408163265306, 5);
  });
  it('linear(0.428571428571) === 0.428571428571', () => {
    expect(linear(0.428571428571)).toBeCloseTo(0.428571428571, 5);
  });
  it('linear(0.448979591837) === 0.448979591837', () => {
    expect(linear(0.448979591837)).toBeCloseTo(0.448979591837, 5);
  });
  it('linear(0.469387755102) === 0.469387755102', () => {
    expect(linear(0.469387755102)).toBeCloseTo(0.469387755102, 5);
  });
  it('linear(0.489795918367) === 0.489795918367', () => {
    expect(linear(0.489795918367)).toBeCloseTo(0.489795918367, 5);
  });
  it('linear(0.510204081633) === 0.510204081633', () => {
    expect(linear(0.510204081633)).toBeCloseTo(0.510204081633, 5);
  });
  it('linear(0.530612244898) === 0.530612244898', () => {
    expect(linear(0.530612244898)).toBeCloseTo(0.530612244898, 5);
  });
  it('linear(0.551020408163) === 0.551020408163', () => {
    expect(linear(0.551020408163)).toBeCloseTo(0.551020408163, 5);
  });
  it('linear(0.571428571429) === 0.571428571429', () => {
    expect(linear(0.571428571429)).toBeCloseTo(0.571428571429, 5);
  });
  it('linear(0.591836734694) === 0.591836734694', () => {
    expect(linear(0.591836734694)).toBeCloseTo(0.591836734694, 5);
  });
  it('linear(0.612244897959) === 0.612244897959', () => {
    expect(linear(0.612244897959)).toBeCloseTo(0.612244897959, 5);
  });
  it('linear(0.632653061224) === 0.632653061224', () => {
    expect(linear(0.632653061224)).toBeCloseTo(0.632653061224, 5);
  });
  it('linear(0.65306122449) === 0.65306122449', () => {
    expect(linear(0.65306122449)).toBeCloseTo(0.65306122449, 5);
  });
  it('linear(0.673469387755) === 0.673469387755', () => {
    expect(linear(0.673469387755)).toBeCloseTo(0.673469387755, 5);
  });
  it('linear(0.69387755102) === 0.69387755102', () => {
    expect(linear(0.69387755102)).toBeCloseTo(0.69387755102, 5);
  });
  it('linear(0.714285714286) === 0.714285714286', () => {
    expect(linear(0.714285714286)).toBeCloseTo(0.714285714286, 5);
  });
  it('linear(0.734693877551) === 0.734693877551', () => {
    expect(linear(0.734693877551)).toBeCloseTo(0.734693877551, 5);
  });
  it('linear(0.755102040816) === 0.755102040816', () => {
    expect(linear(0.755102040816)).toBeCloseTo(0.755102040816, 5);
  });
  it('linear(0.775510204082) === 0.775510204082', () => {
    expect(linear(0.775510204082)).toBeCloseTo(0.775510204082, 5);
  });
  it('linear(0.795918367347) === 0.795918367347', () => {
    expect(linear(0.795918367347)).toBeCloseTo(0.795918367347, 5);
  });
  it('linear(0.816326530612) === 0.816326530612', () => {
    expect(linear(0.816326530612)).toBeCloseTo(0.816326530612, 5);
  });
  it('linear(0.836734693878) === 0.836734693878', () => {
    expect(linear(0.836734693878)).toBeCloseTo(0.836734693878, 5);
  });
  it('linear(0.857142857143) === 0.857142857143', () => {
    expect(linear(0.857142857143)).toBeCloseTo(0.857142857143, 5);
  });
  it('linear(0.877551020408) === 0.877551020408', () => {
    expect(linear(0.877551020408)).toBeCloseTo(0.877551020408, 5);
  });
  it('linear(0.897959183673) === 0.897959183673', () => {
    expect(linear(0.897959183673)).toBeCloseTo(0.897959183673, 5);
  });
  it('linear(0.918367346939) === 0.918367346939', () => {
    expect(linear(0.918367346939)).toBeCloseTo(0.918367346939, 5);
  });
  it('linear(0.938775510204) === 0.938775510204', () => {
    expect(linear(0.938775510204)).toBeCloseTo(0.938775510204, 5);
  });
  it('linear(0.959183673469) === 0.959183673469', () => {
    expect(linear(0.959183673469)).toBeCloseTo(0.959183673469, 5);
  });
  it('linear(0.979591836735) === 0.979591836735', () => {
    expect(linear(0.979591836735)).toBeCloseTo(0.979591836735, 5);
  });
  it('linear(1) === 1', () => {
    expect(linear(1)).toBeCloseTo(1, 5);
  });
});

describe('easeInQuad', () => {
  it('easeInQuad(0) ~ 0', () => {
    expect(easeInQuad(0)).toBeCloseTo(0, 5);
  });
  it('easeInQuad(0.020408163265) ~ 0.000416493128', () => {
    expect(easeInQuad(0.020408163265)).toBeCloseTo(0.000416493128, 5);
  });
  it('easeInQuad(0.040816326531) ~ 0.001665972511', () => {
    expect(easeInQuad(0.040816326531)).toBeCloseTo(0.001665972511, 5);
  });
  it('easeInQuad(0.061224489796) ~ 0.003748438151', () => {
    expect(easeInQuad(0.061224489796)).toBeCloseTo(0.003748438151, 5);
  });
  it('easeInQuad(0.081632653061) ~ 0.006663890046', () => {
    expect(easeInQuad(0.081632653061)).toBeCloseTo(0.006663890046, 5);
  });
  it('easeInQuad(0.102040816327) ~ 0.010412328197', () => {
    expect(easeInQuad(0.102040816327)).toBeCloseTo(0.010412328197, 5);
  });
  it('easeInQuad(0.122448979592) ~ 0.014993752603', () => {
    expect(easeInQuad(0.122448979592)).toBeCloseTo(0.014993752603, 5);
  });
  it('easeInQuad(0.142857142857) ~ 0.020408163265', () => {
    expect(easeInQuad(0.142857142857)).toBeCloseTo(0.020408163265, 5);
  });
  it('easeInQuad(0.163265306122) ~ 0.026655560183', () => {
    expect(easeInQuad(0.163265306122)).toBeCloseTo(0.026655560183, 5);
  });
  it('easeInQuad(0.183673469388) ~ 0.033735943357', () => {
    expect(easeInQuad(0.183673469388)).toBeCloseTo(0.033735943357, 5);
  });
  it('easeInQuad(0.204081632653) ~ 0.041649312786', () => {
    expect(easeInQuad(0.204081632653)).toBeCloseTo(0.041649312786, 5);
  });
  it('easeInQuad(0.224489795918) ~ 0.050395668471', () => {
    expect(easeInQuad(0.224489795918)).toBeCloseTo(0.050395668471, 5);
  });
  it('easeInQuad(0.244897959184) ~ 0.059975010412', () => {
    expect(easeInQuad(0.244897959184)).toBeCloseTo(0.059975010412, 5);
  });
  it('easeInQuad(0.265306122449) ~ 0.070387338609', () => {
    expect(easeInQuad(0.265306122449)).toBeCloseTo(0.070387338609, 5);
  });
  it('easeInQuad(0.285714285714) ~ 0.081632653061', () => {
    expect(easeInQuad(0.285714285714)).toBeCloseTo(0.081632653061, 5);
  });
  it('easeInQuad(0.30612244898) ~ 0.093710953769', () => {
    expect(easeInQuad(0.30612244898)).toBeCloseTo(0.093710953769, 5);
  });
  it('easeInQuad(0.326530612245) ~ 0.106622240733', () => {
    expect(easeInQuad(0.326530612245)).toBeCloseTo(0.106622240733, 5);
  });
  it('easeInQuad(0.34693877551) ~ 0.120366513953', () => {
    expect(easeInQuad(0.34693877551)).toBeCloseTo(0.120366513953, 5);
  });
  it('easeInQuad(0.367346938776) ~ 0.134943773428', () => {
    expect(easeInQuad(0.367346938776)).toBeCloseTo(0.134943773428, 5);
  });
  it('easeInQuad(0.387755102041) ~ 0.150354019159', () => {
    expect(easeInQuad(0.387755102041)).toBeCloseTo(0.150354019159, 5);
  });
  it('easeInQuad(0.408163265306) ~ 0.166597251145', () => {
    expect(easeInQuad(0.408163265306)).toBeCloseTo(0.166597251145, 5);
  });
  it('easeInQuad(0.428571428571) ~ 0.183673469388', () => {
    expect(easeInQuad(0.428571428571)).toBeCloseTo(0.183673469388, 5);
  });
  it('easeInQuad(0.448979591837) ~ 0.201582673886', () => {
    expect(easeInQuad(0.448979591837)).toBeCloseTo(0.201582673886, 5);
  });
  it('easeInQuad(0.469387755102) ~ 0.22032486464', () => {
    expect(easeInQuad(0.469387755102)).toBeCloseTo(0.22032486464, 5);
  });
  it('easeInQuad(0.489795918367) ~ 0.239900041649', () => {
    expect(easeInQuad(0.489795918367)).toBeCloseTo(0.239900041649, 5);
  });
  it('easeInQuad(0.510204081633) ~ 0.260308204915', () => {
    expect(easeInQuad(0.510204081633)).toBeCloseTo(0.260308204915, 5);
  });
  it('easeInQuad(0.530612244898) ~ 0.281549354436', () => {
    expect(easeInQuad(0.530612244898)).toBeCloseTo(0.281549354436, 5);
  });
  it('easeInQuad(0.551020408163) ~ 0.303623490212', () => {
    expect(easeInQuad(0.551020408163)).toBeCloseTo(0.303623490212, 5);
  });
  it('easeInQuad(0.571428571429) ~ 0.326530612245', () => {
    expect(easeInQuad(0.571428571429)).toBeCloseTo(0.326530612245, 5);
  });
  it('easeInQuad(0.591836734694) ~ 0.350270720533', () => {
    expect(easeInQuad(0.591836734694)).toBeCloseTo(0.350270720533, 5);
  });
  it('easeInQuad(0.612244897959) ~ 0.374843815077', () => {
    expect(easeInQuad(0.612244897959)).toBeCloseTo(0.374843815077, 5);
  });
  it('easeInQuad(0.632653061224) ~ 0.400249895877', () => {
    expect(easeInQuad(0.632653061224)).toBeCloseTo(0.400249895877, 5);
  });
  it('easeInQuad(0.65306122449) ~ 0.426488962932', () => {
    expect(easeInQuad(0.65306122449)).toBeCloseTo(0.426488962932, 5);
  });
  it('easeInQuad(0.673469387755) ~ 0.453561016243', () => {
    expect(easeInQuad(0.673469387755)).toBeCloseTo(0.453561016243, 5);
  });
  it('easeInQuad(0.69387755102) ~ 0.48146605581', () => {
    expect(easeInQuad(0.69387755102)).toBeCloseTo(0.48146605581, 5);
  });
  it('easeInQuad(0.714285714286) ~ 0.510204081633', () => {
    expect(easeInQuad(0.714285714286)).toBeCloseTo(0.510204081633, 5);
  });
  it('easeInQuad(0.734693877551) ~ 0.539775093711', () => {
    expect(easeInQuad(0.734693877551)).toBeCloseTo(0.539775093711, 5);
  });
  it('easeInQuad(0.755102040816) ~ 0.570179092045', () => {
    expect(easeInQuad(0.755102040816)).toBeCloseTo(0.570179092045, 5);
  });
  it('easeInQuad(0.775510204082) ~ 0.601416076635', () => {
    expect(easeInQuad(0.775510204082)).toBeCloseTo(0.601416076635, 5);
  });
  it('easeInQuad(0.795918367347) ~ 0.63348604748', () => {
    expect(easeInQuad(0.795918367347)).toBeCloseTo(0.63348604748, 5);
  });
  it('easeInQuad(0.816326530612) ~ 0.666389004581', () => {
    expect(easeInQuad(0.816326530612)).toBeCloseTo(0.666389004581, 5);
  });
  it('easeInQuad(0.836734693878) ~ 0.700124947938', () => {
    expect(easeInQuad(0.836734693878)).toBeCloseTo(0.700124947938, 5);
  });
  it('easeInQuad(0.857142857143) ~ 0.734693877551', () => {
    expect(easeInQuad(0.857142857143)).toBeCloseTo(0.734693877551, 5);
  });
  it('easeInQuad(0.877551020408) ~ 0.770095793419', () => {
    expect(easeInQuad(0.877551020408)).toBeCloseTo(0.770095793419, 5);
  });
  it('easeInQuad(0.897959183673) ~ 0.806330695544', () => {
    expect(easeInQuad(0.897959183673)).toBeCloseTo(0.806330695544, 5);
  });
  it('easeInQuad(0.918367346939) ~ 0.843398583923', () => {
    expect(easeInQuad(0.918367346939)).toBeCloseTo(0.843398583923, 5);
  });
  it('easeInQuad(0.938775510204) ~ 0.881299458559', () => {
    expect(easeInQuad(0.938775510204)).toBeCloseTo(0.881299458559, 5);
  });
  it('easeInQuad(0.959183673469) ~ 0.92003331945', () => {
    expect(easeInQuad(0.959183673469)).toBeCloseTo(0.92003331945, 5);
  });
  it('easeInQuad(0.979591836735) ~ 0.959600166597', () => {
    expect(easeInQuad(0.979591836735)).toBeCloseTo(0.959600166597, 5);
  });
  it('easeInQuad(1) ~ 1', () => {
    expect(easeInQuad(1)).toBeCloseTo(1, 5);
  });
});

describe('easeOutQuad', () => {
  it('easeOutQuad(0) ~ 0', () => {
    expect(easeOutQuad(0)).toBeCloseTo(0, 5);
  });
  it('easeOutQuad(0.020408163265) ~ 0.040399833403', () => {
    expect(easeOutQuad(0.020408163265)).toBeCloseTo(0.040399833403, 5);
  });
  it('easeOutQuad(0.040816326531) ~ 0.07996668055', () => {
    expect(easeOutQuad(0.040816326531)).toBeCloseTo(0.07996668055, 5);
  });
  it('easeOutQuad(0.061224489796) ~ 0.118700541441', () => {
    expect(easeOutQuad(0.061224489796)).toBeCloseTo(0.118700541441, 5);
  });
  it('easeOutQuad(0.081632653061) ~ 0.156601416077', () => {
    expect(easeOutQuad(0.081632653061)).toBeCloseTo(0.156601416077, 5);
  });
  it('easeOutQuad(0.102040816327) ~ 0.193669304456', () => {
    expect(easeOutQuad(0.102040816327)).toBeCloseTo(0.193669304456, 5);
  });
  it('easeOutQuad(0.122448979592) ~ 0.229904206581', () => {
    expect(easeOutQuad(0.122448979592)).toBeCloseTo(0.229904206581, 5);
  });
  it('easeOutQuad(0.142857142857) ~ 0.265306122449', () => {
    expect(easeOutQuad(0.142857142857)).toBeCloseTo(0.265306122449, 5);
  });
  it('easeOutQuad(0.163265306122) ~ 0.299875052062', () => {
    expect(easeOutQuad(0.163265306122)).toBeCloseTo(0.299875052062, 5);
  });
  it('easeOutQuad(0.183673469388) ~ 0.333610995419', () => {
    expect(easeOutQuad(0.183673469388)).toBeCloseTo(0.333610995419, 5);
  });
  it('easeOutQuad(0.204081632653) ~ 0.36651395252', () => {
    expect(easeOutQuad(0.204081632653)).toBeCloseTo(0.36651395252, 5);
  });
  it('easeOutQuad(0.224489795918) ~ 0.398583923365', () => {
    expect(easeOutQuad(0.224489795918)).toBeCloseTo(0.398583923365, 5);
  });
  it('easeOutQuad(0.244897959184) ~ 0.429820907955', () => {
    expect(easeOutQuad(0.244897959184)).toBeCloseTo(0.429820907955, 5);
  });
  it('easeOutQuad(0.265306122449) ~ 0.460224906289', () => {
    expect(easeOutQuad(0.265306122449)).toBeCloseTo(0.460224906289, 5);
  });
  it('easeOutQuad(0.285714285714) ~ 0.489795918367', () => {
    expect(easeOutQuad(0.285714285714)).toBeCloseTo(0.489795918367, 5);
  });
  it('easeOutQuad(0.30612244898) ~ 0.51853394419', () => {
    expect(easeOutQuad(0.30612244898)).toBeCloseTo(0.51853394419, 5);
  });
  it('easeOutQuad(0.326530612245) ~ 0.546438983757', () => {
    expect(easeOutQuad(0.326530612245)).toBeCloseTo(0.546438983757, 5);
  });
  it('easeOutQuad(0.34693877551) ~ 0.573511037068', () => {
    expect(easeOutQuad(0.34693877551)).toBeCloseTo(0.573511037068, 5);
  });
  it('easeOutQuad(0.367346938776) ~ 0.599750104123', () => {
    expect(easeOutQuad(0.367346938776)).toBeCloseTo(0.599750104123, 5);
  });
  it('easeOutQuad(0.387755102041) ~ 0.625156184923', () => {
    expect(easeOutQuad(0.387755102041)).toBeCloseTo(0.625156184923, 5);
  });
  it('easeOutQuad(0.408163265306) ~ 0.649729279467', () => {
    expect(easeOutQuad(0.408163265306)).toBeCloseTo(0.649729279467, 5);
  });
  it('easeOutQuad(0.428571428571) ~ 0.673469387755', () => {
    expect(easeOutQuad(0.428571428571)).toBeCloseTo(0.673469387755, 5);
  });
  it('easeOutQuad(0.448979591837) ~ 0.696376509788', () => {
    expect(easeOutQuad(0.448979591837)).toBeCloseTo(0.696376509788, 5);
  });
  it('easeOutQuad(0.469387755102) ~ 0.718450645564', () => {
    expect(easeOutQuad(0.469387755102)).toBeCloseTo(0.718450645564, 5);
  });
  it('easeOutQuad(0.489795918367) ~ 0.739691795085', () => {
    expect(easeOutQuad(0.489795918367)).toBeCloseTo(0.739691795085, 5);
  });
  it('easeOutQuad(0.510204081633) ~ 0.760099958351', () => {
    expect(easeOutQuad(0.510204081633)).toBeCloseTo(0.760099958351, 5);
  });
  it('easeOutQuad(0.530612244898) ~ 0.77967513536', () => {
    expect(easeOutQuad(0.530612244898)).toBeCloseTo(0.77967513536, 5);
  });
  it('easeOutQuad(0.551020408163) ~ 0.798417326114', () => {
    expect(easeOutQuad(0.551020408163)).toBeCloseTo(0.798417326114, 5);
  });
  it('easeOutQuad(0.571428571429) ~ 0.816326530612', () => {
    expect(easeOutQuad(0.571428571429)).toBeCloseTo(0.816326530612, 5);
  });
  it('easeOutQuad(0.591836734694) ~ 0.833402748855', () => {
    expect(easeOutQuad(0.591836734694)).toBeCloseTo(0.833402748855, 5);
  });
  it('easeOutQuad(0.612244897959) ~ 0.849645980841', () => {
    expect(easeOutQuad(0.612244897959)).toBeCloseTo(0.849645980841, 5);
  });
  it('easeOutQuad(0.632653061224) ~ 0.865056226572', () => {
    expect(easeOutQuad(0.632653061224)).toBeCloseTo(0.865056226572, 5);
  });
  it('easeOutQuad(0.65306122449) ~ 0.879633486047', () => {
    expect(easeOutQuad(0.65306122449)).toBeCloseTo(0.879633486047, 5);
  });
  it('easeOutQuad(0.673469387755) ~ 0.893377759267', () => {
    expect(easeOutQuad(0.673469387755)).toBeCloseTo(0.893377759267, 5);
  });
  it('easeOutQuad(0.69387755102) ~ 0.906289046231', () => {
    expect(easeOutQuad(0.69387755102)).toBeCloseTo(0.906289046231, 5);
  });
  it('easeOutQuad(0.714285714286) ~ 0.918367346939', () => {
    expect(easeOutQuad(0.714285714286)).toBeCloseTo(0.918367346939, 5);
  });
  it('easeOutQuad(0.734693877551) ~ 0.929612661391', () => {
    expect(easeOutQuad(0.734693877551)).toBeCloseTo(0.929612661391, 5);
  });
  it('easeOutQuad(0.755102040816) ~ 0.940024989588', () => {
    expect(easeOutQuad(0.755102040816)).toBeCloseTo(0.940024989588, 5);
  });
  it('easeOutQuad(0.775510204082) ~ 0.949604331529', () => {
    expect(easeOutQuad(0.775510204082)).toBeCloseTo(0.949604331529, 5);
  });
  it('easeOutQuad(0.795918367347) ~ 0.958350687214', () => {
    expect(easeOutQuad(0.795918367347)).toBeCloseTo(0.958350687214, 5);
  });
  it('easeOutQuad(0.816326530612) ~ 0.966264056643', () => {
    expect(easeOutQuad(0.816326530612)).toBeCloseTo(0.966264056643, 5);
  });
  it('easeOutQuad(0.836734693878) ~ 0.973344439817', () => {
    expect(easeOutQuad(0.836734693878)).toBeCloseTo(0.973344439817, 5);
  });
  it('easeOutQuad(0.857142857143) ~ 0.979591836735', () => {
    expect(easeOutQuad(0.857142857143)).toBeCloseTo(0.979591836735, 5);
  });
  it('easeOutQuad(0.877551020408) ~ 0.985006247397', () => {
    expect(easeOutQuad(0.877551020408)).toBeCloseTo(0.985006247397, 5);
  });
  it('easeOutQuad(0.897959183673) ~ 0.989587671803', () => {
    expect(easeOutQuad(0.897959183673)).toBeCloseTo(0.989587671803, 5);
  });
  it('easeOutQuad(0.918367346939) ~ 0.993336109954', () => {
    expect(easeOutQuad(0.918367346939)).toBeCloseTo(0.993336109954, 5);
  });
  it('easeOutQuad(0.938775510204) ~ 0.996251561849', () => {
    expect(easeOutQuad(0.938775510204)).toBeCloseTo(0.996251561849, 5);
  });
  it('easeOutQuad(0.959183673469) ~ 0.998334027489', () => {
    expect(easeOutQuad(0.959183673469)).toBeCloseTo(0.998334027489, 5);
  });
  it('easeOutQuad(0.979591836735) ~ 0.999583506872', () => {
    expect(easeOutQuad(0.979591836735)).toBeCloseTo(0.999583506872, 5);
  });
  it('easeOutQuad(1) ~ 1', () => {
    expect(easeOutQuad(1)).toBeCloseTo(1, 5);
  });
});

describe('easeInOutQuad', () => {
  it('easeInOutQuad(0) ~ 0', () => {
    expect(easeInOutQuad(0)).toBeCloseTo(0, 5);
  });
  it('easeInOutQuad(0.020408163265) ~ 0.000832986256', () => {
    expect(easeInOutQuad(0.020408163265)).toBeCloseTo(0.000832986256, 5);
  });
  it('easeInOutQuad(0.040816326531) ~ 0.003331945023', () => {
    expect(easeInOutQuad(0.040816326531)).toBeCloseTo(0.003331945023, 5);
  });
  it('easeInOutQuad(0.061224489796) ~ 0.007496876302', () => {
    expect(easeInOutQuad(0.061224489796)).toBeCloseTo(0.007496876302, 5);
  });
  it('easeInOutQuad(0.081632653061) ~ 0.013327780092', () => {
    expect(easeInOutQuad(0.081632653061)).toBeCloseTo(0.013327780092, 5);
  });
  it('easeInOutQuad(0.102040816327) ~ 0.020824656393', () => {
    expect(easeInOutQuad(0.102040816327)).toBeCloseTo(0.020824656393, 5);
  });
  it('easeInOutQuad(0.122448979592) ~ 0.029987505206', () => {
    expect(easeInOutQuad(0.122448979592)).toBeCloseTo(0.029987505206, 5);
  });
  it('easeInOutQuad(0.142857142857) ~ 0.040816326531', () => {
    expect(easeInOutQuad(0.142857142857)).toBeCloseTo(0.040816326531, 5);
  });
  it('easeInOutQuad(0.163265306122) ~ 0.053311120367', () => {
    expect(easeInOutQuad(0.163265306122)).toBeCloseTo(0.053311120367, 5);
  });
  it('easeInOutQuad(0.183673469388) ~ 0.067471886714', () => {
    expect(easeInOutQuad(0.183673469388)).toBeCloseTo(0.067471886714, 5);
  });
  it('easeInOutQuad(0.204081632653) ~ 0.083298625573', () => {
    expect(easeInOutQuad(0.204081632653)).toBeCloseTo(0.083298625573, 5);
  });
  it('easeInOutQuad(0.224489795918) ~ 0.100791336943', () => {
    expect(easeInOutQuad(0.224489795918)).toBeCloseTo(0.100791336943, 5);
  });
  it('easeInOutQuad(0.244897959184) ~ 0.119950020825', () => {
    expect(easeInOutQuad(0.244897959184)).toBeCloseTo(0.119950020825, 5);
  });
  it('easeInOutQuad(0.265306122449) ~ 0.140774677218', () => {
    expect(easeInOutQuad(0.265306122449)).toBeCloseTo(0.140774677218, 5);
  });
  it('easeInOutQuad(0.285714285714) ~ 0.163265306122', () => {
    expect(easeInOutQuad(0.285714285714)).toBeCloseTo(0.163265306122, 5);
  });
  it('easeInOutQuad(0.30612244898) ~ 0.187421907539', () => {
    expect(easeInOutQuad(0.30612244898)).toBeCloseTo(0.187421907539, 5);
  });
  it('easeInOutQuad(0.326530612245) ~ 0.213244481466', () => {
    expect(easeInOutQuad(0.326530612245)).toBeCloseTo(0.213244481466, 5);
  });
  it('easeInOutQuad(0.34693877551) ~ 0.240733027905', () => {
    expect(easeInOutQuad(0.34693877551)).toBeCloseTo(0.240733027905, 5);
  });
  it('easeInOutQuad(0.367346938776) ~ 0.269887546855', () => {
    expect(easeInOutQuad(0.367346938776)).toBeCloseTo(0.269887546855, 5);
  });
  it('easeInOutQuad(0.387755102041) ~ 0.300708038317', () => {
    expect(easeInOutQuad(0.387755102041)).toBeCloseTo(0.300708038317, 5);
  });
  it('easeInOutQuad(0.408163265306) ~ 0.333194502291', () => {
    expect(easeInOutQuad(0.408163265306)).toBeCloseTo(0.333194502291, 5);
  });
  it('easeInOutQuad(0.428571428571) ~ 0.367346938776', () => {
    expect(easeInOutQuad(0.428571428571)).toBeCloseTo(0.367346938776, 5);
  });
  it('easeInOutQuad(0.448979591837) ~ 0.403165347772', () => {
    expect(easeInOutQuad(0.448979591837)).toBeCloseTo(0.403165347772, 5);
  });
  it('easeInOutQuad(0.469387755102) ~ 0.440649729279', () => {
    expect(easeInOutQuad(0.469387755102)).toBeCloseTo(0.440649729279, 5);
  });
  it('easeInOutQuad(0.489795918367) ~ 0.479800083299', () => {
    expect(easeInOutQuad(0.489795918367)).toBeCloseTo(0.479800083299, 5);
  });
  it('easeInOutQuad(0.510204081633) ~ 0.520199916701', () => {
    expect(easeInOutQuad(0.510204081633)).toBeCloseTo(0.520199916701, 5);
  });
  it('easeInOutQuad(0.530612244898) ~ 0.559350270721', () => {
    expect(easeInOutQuad(0.530612244898)).toBeCloseTo(0.559350270721, 5);
  });
  it('easeInOutQuad(0.551020408163) ~ 0.596834652228', () => {
    expect(easeInOutQuad(0.551020408163)).toBeCloseTo(0.596834652228, 5);
  });
  it('easeInOutQuad(0.571428571429) ~ 0.632653061224', () => {
    expect(easeInOutQuad(0.571428571429)).toBeCloseTo(0.632653061224, 5);
  });
  it('easeInOutQuad(0.591836734694) ~ 0.666805497709', () => {
    expect(easeInOutQuad(0.591836734694)).toBeCloseTo(0.666805497709, 5);
  });
  it('easeInOutQuad(0.612244897959) ~ 0.699291961683', () => {
    expect(easeInOutQuad(0.612244897959)).toBeCloseTo(0.699291961683, 5);
  });
  it('easeInOutQuad(0.632653061224) ~ 0.730112453145', () => {
    expect(easeInOutQuad(0.632653061224)).toBeCloseTo(0.730112453145, 5);
  });
  it('easeInOutQuad(0.65306122449) ~ 0.759266972095', () => {
    expect(easeInOutQuad(0.65306122449)).toBeCloseTo(0.759266972095, 5);
  });
  it('easeInOutQuad(0.673469387755) ~ 0.786755518534', () => {
    expect(easeInOutQuad(0.673469387755)).toBeCloseTo(0.786755518534, 5);
  });
  it('easeInOutQuad(0.69387755102) ~ 0.812578092461', () => {
    expect(easeInOutQuad(0.69387755102)).toBeCloseTo(0.812578092461, 5);
  });
  it('easeInOutQuad(0.714285714286) ~ 0.836734693878', () => {
    expect(easeInOutQuad(0.714285714286)).toBeCloseTo(0.836734693878, 5);
  });
  it('easeInOutQuad(0.734693877551) ~ 0.859225322782', () => {
    expect(easeInOutQuad(0.734693877551)).toBeCloseTo(0.859225322782, 5);
  });
  it('easeInOutQuad(0.755102040816) ~ 0.880049979175', () => {
    expect(easeInOutQuad(0.755102040816)).toBeCloseTo(0.880049979175, 5);
  });
  it('easeInOutQuad(0.775510204082) ~ 0.899208663057', () => {
    expect(easeInOutQuad(0.775510204082)).toBeCloseTo(0.899208663057, 5);
  });
  it('easeInOutQuad(0.795918367347) ~ 0.916701374427', () => {
    expect(easeInOutQuad(0.795918367347)).toBeCloseTo(0.916701374427, 5);
  });
  it('easeInOutQuad(0.816326530612) ~ 0.932528113286', () => {
    expect(easeInOutQuad(0.816326530612)).toBeCloseTo(0.932528113286, 5);
  });
  it('easeInOutQuad(0.836734693878) ~ 0.946688879633', () => {
    expect(easeInOutQuad(0.836734693878)).toBeCloseTo(0.946688879633, 5);
  });
  it('easeInOutQuad(0.857142857143) ~ 0.959183673469', () => {
    expect(easeInOutQuad(0.857142857143)).toBeCloseTo(0.959183673469, 5);
  });
  it('easeInOutQuad(0.877551020408) ~ 0.970012494794', () => {
    expect(easeInOutQuad(0.877551020408)).toBeCloseTo(0.970012494794, 5);
  });
  it('easeInOutQuad(0.897959183673) ~ 0.979175343607', () => {
    expect(easeInOutQuad(0.897959183673)).toBeCloseTo(0.979175343607, 5);
  });
  it('easeInOutQuad(0.918367346939) ~ 0.986672219908', () => {
    expect(easeInOutQuad(0.918367346939)).toBeCloseTo(0.986672219908, 5);
  });
  it('easeInOutQuad(0.938775510204) ~ 0.992503123698', () => {
    expect(easeInOutQuad(0.938775510204)).toBeCloseTo(0.992503123698, 5);
  });
  it('easeInOutQuad(0.959183673469) ~ 0.996668054977', () => {
    expect(easeInOutQuad(0.959183673469)).toBeCloseTo(0.996668054977, 5);
  });
  it('easeInOutQuad(0.979591836735) ~ 0.999167013744', () => {
    expect(easeInOutQuad(0.979591836735)).toBeCloseTo(0.999167013744, 5);
  });
  it('easeInOutQuad(1) ~ 1', () => {
    expect(easeInOutQuad(1)).toBeCloseTo(1, 5);
  });
});

describe('easeInCubic', () => {
  it('easeInCubic(0) ~ 0', () => {
    expect(easeInCubic(0)).toBeCloseTo(0, 5);
  });
  it('easeInCubic(0.020408163265) ~ 8.49986e-06', () => {
    expect(easeInCubic(0.020408163265)).toBeCloseTo(8.49986e-06, 5);
  });
  it('easeInCubic(0.040816326531) ~ 6.7998878e-05', () => {
    expect(easeInCubic(0.040816326531)).toBeCloseTo(6.7998878e-05, 5);
  });
  it('easeInCubic(0.061224489796) ~ 0.000229496213', () => {
    expect(easeInCubic(0.061224489796)).toBeCloseTo(0.000229496213, 5);
  });
  it('easeInCubic(0.081632653061) ~ 0.000543991024', () => {
    expect(easeInCubic(0.081632653061)).toBeCloseTo(0.000543991024, 5);
  });
  it('easeInCubic(0.102040816327) ~ 0.001062482469', () => {
    expect(easeInCubic(0.102040816327)).toBeCloseTo(0.001062482469, 5);
  });
  it('easeInCubic(0.122448979592) ~ 0.001835969706', () => {
    expect(easeInCubic(0.122448979592)).toBeCloseTo(0.001835969706, 5);
  });
  it('easeInCubic(0.142857142857) ~ 0.002915451895', () => {
    expect(easeInCubic(0.142857142857)).toBeCloseTo(0.002915451895, 5);
  });
  it('easeInCubic(0.163265306122) ~ 0.004351928193', () => {
    expect(easeInCubic(0.163265306122)).toBeCloseTo(0.004351928193, 5);
  });
  it('easeInCubic(0.183673469388) ~ 0.006196397759', () => {
    expect(easeInCubic(0.183673469388)).toBeCloseTo(0.006196397759, 5);
  });
  it('easeInCubic(0.204081632653) ~ 0.008499859752', () => {
    expect(easeInCubic(0.204081632653)).toBeCloseTo(0.008499859752, 5);
  });
  it('easeInCubic(0.224489795918) ~ 0.01131331333', () => {
    expect(easeInCubic(0.224489795918)).toBeCloseTo(0.01131331333, 5);
  });
  it('easeInCubic(0.244897959184) ~ 0.014687757652', () => {
    expect(easeInCubic(0.244897959184)).toBeCloseTo(0.014687757652, 5);
  });
  it('easeInCubic(0.265306122449) ~ 0.018674191876', () => {
    expect(easeInCubic(0.265306122449)).toBeCloseTo(0.018674191876, 5);
  });
  it('easeInCubic(0.285714285714) ~ 0.02332361516', () => {
    expect(easeInCubic(0.285714285714)).toBeCloseTo(0.02332361516, 5);
  });
  it('easeInCubic(0.30612244898) ~ 0.028687026664', () => {
    expect(easeInCubic(0.30612244898)).toBeCloseTo(0.028687026664, 5);
  });
  it('easeInCubic(0.326530612245) ~ 0.034815425545', () => {
    expect(easeInCubic(0.326530612245)).toBeCloseTo(0.034815425545, 5);
  });
  it('easeInCubic(0.34693877551) ~ 0.041759810963', () => {
    expect(easeInCubic(0.34693877551)).toBeCloseTo(0.041759810963, 5);
  });
  it('easeInCubic(0.367346938776) ~ 0.049571182075', () => {
    expect(easeInCubic(0.367346938776)).toBeCloseTo(0.049571182075, 5);
  });
  it('easeInCubic(0.387755102041) ~ 0.058300538041', () => {
    expect(easeInCubic(0.387755102041)).toBeCloseTo(0.058300538041, 5);
  });
  it('easeInCubic(0.408163265306) ~ 0.067998878019', () => {
    expect(easeInCubic(0.408163265306)).toBeCloseTo(0.067998878019, 5);
  });
  it('easeInCubic(0.428571428571) ~ 0.078717201166', () => {
    expect(easeInCubic(0.428571428571)).toBeCloseTo(0.078717201166, 5);
  });
  it('easeInCubic(0.448979591837) ~ 0.090506506643', () => {
    expect(easeInCubic(0.448979591837)).toBeCloseTo(0.090506506643, 5);
  });
  it('easeInCubic(0.469387755102) ~ 0.103417793606', () => {
    expect(easeInCubic(0.469387755102)).toBeCloseTo(0.103417793606, 5);
  });
  it('easeInCubic(0.489795918367) ~ 0.117502061216', () => {
    expect(easeInCubic(0.489795918367)).toBeCloseTo(0.117502061216, 5);
  });
  it('easeInCubic(0.510204081633) ~ 0.13281030863', () => {
    expect(easeInCubic(0.510204081633)).toBeCloseTo(0.13281030863, 5);
  });
  it('easeInCubic(0.530612244898) ~ 0.149393535007', () => {
    expect(easeInCubic(0.530612244898)).toBeCloseTo(0.149393535007, 5);
  });
  it('easeInCubic(0.551020408163) ~ 0.167302739505', () => {
    expect(easeInCubic(0.551020408163)).toBeCloseTo(0.167302739505, 5);
  });
  it('easeInCubic(0.571428571429) ~ 0.186588921283', () => {
    expect(easeInCubic(0.571428571429)).toBeCloseTo(0.186588921283, 5);
  });
  it('easeInCubic(0.591836734694) ~ 0.207303079499', () => {
    expect(easeInCubic(0.591836734694)).toBeCloseTo(0.207303079499, 5);
  });
  it('easeInCubic(0.612244897959) ~ 0.229496213312', () => {
    expect(easeInCubic(0.612244897959)).toBeCloseTo(0.229496213312, 5);
  });
  it('easeInCubic(0.632653061224) ~ 0.253219321881', () => {
    expect(easeInCubic(0.632653061224)).toBeCloseTo(0.253219321881, 5);
  });
  it('easeInCubic(0.65306122449) ~ 0.278523404364', () => {
    expect(easeInCubic(0.65306122449)).toBeCloseTo(0.278523404364, 5);
  });
  it('easeInCubic(0.673469387755) ~ 0.305459459919', () => {
    expect(easeInCubic(0.673469387755)).toBeCloseTo(0.305459459919, 5);
  });
  it('easeInCubic(0.69387755102) ~ 0.334078487705', () => {
    expect(easeInCubic(0.69387755102)).toBeCloseTo(0.334078487705, 5);
  });
  it('easeInCubic(0.714285714286) ~ 0.36443148688', () => {
    expect(easeInCubic(0.714285714286)).toBeCloseTo(0.36443148688, 5);
  });
  it('easeInCubic(0.734693877551) ~ 0.396569456604', () => {
    expect(easeInCubic(0.734693877551)).toBeCloseTo(0.396569456604, 5);
  });
  it('easeInCubic(0.755102040816) ~ 0.430543396034', () => {
    expect(easeInCubic(0.755102040816)).toBeCloseTo(0.430543396034, 5);
  });
  it('easeInCubic(0.775510204082) ~ 0.466404304329', () => {
    expect(easeInCubic(0.775510204082)).toBeCloseTo(0.466404304329, 5);
  });
  it('easeInCubic(0.795918367347) ~ 0.504203180648', () => {
    expect(easeInCubic(0.795918367347)).toBeCloseTo(0.504203180648, 5);
  });
  it('easeInCubic(0.816326530612) ~ 0.543991024148', () => {
    expect(easeInCubic(0.816326530612)).toBeCloseTo(0.543991024148, 5);
  });
  it('easeInCubic(0.836734693878) ~ 0.585818833989', () => {
    expect(easeInCubic(0.836734693878)).toBeCloseTo(0.585818833989, 5);
  });
  it('easeInCubic(0.857142857143) ~ 0.629737609329', () => {
    expect(easeInCubic(0.857142857143)).toBeCloseTo(0.629737609329, 5);
  });
  it('easeInCubic(0.877551020408) ~ 0.675798349327', () => {
    expect(easeInCubic(0.877551020408)).toBeCloseTo(0.675798349327, 5);
  });
  it('easeInCubic(0.897959183673) ~ 0.724052053141', () => {
    expect(easeInCubic(0.897959183673)).toBeCloseTo(0.724052053141, 5);
  });
  it('easeInCubic(0.918367346939) ~ 0.77454971993', () => {
    expect(easeInCubic(0.918367346939)).toBeCloseTo(0.77454971993, 5);
  });
  it('easeInCubic(0.938775510204) ~ 0.827342348851', () => {
    expect(easeInCubic(0.938775510204)).toBeCloseTo(0.827342348851, 5);
  });
  it('easeInCubic(0.959183673469) ~ 0.882480939065', () => {
    expect(easeInCubic(0.959183673469)).toBeCloseTo(0.882480939065, 5);
  });
  it('easeInCubic(0.979591836735) ~ 0.940016489728', () => {
    expect(easeInCubic(0.979591836735)).toBeCloseTo(0.940016489728, 5);
  });
  it('easeInCubic(1) ~ 1', () => {
    expect(easeInCubic(1)).toBeCloseTo(1, 5);
  });
});

describe('easeOutCubic', () => {
  it('easeOutCubic(0) ~ 0', () => {
    expect(easeOutCubic(0)).toBeCloseTo(0, 5);
  });
  it('easeOutCubic(0.020408163265) ~ 0.059983510272', () => {
    expect(easeOutCubic(0.020408163265)).toBeCloseTo(0.059983510272, 5);
  });
  it('easeOutCubic(0.040816326531) ~ 0.117519060935', () => {
    expect(easeOutCubic(0.040816326531)).toBeCloseTo(0.117519060935, 5);
  });
  it('easeOutCubic(0.061224489796) ~ 0.172657651149', () => {
    expect(easeOutCubic(0.061224489796)).toBeCloseTo(0.172657651149, 5);
  });
  it('easeOutCubic(0.081632653061) ~ 0.22545028007', () => {
    expect(easeOutCubic(0.081632653061)).toBeCloseTo(0.22545028007, 5);
  });
  it('easeOutCubic(0.102040816327) ~ 0.275947946859', () => {
    expect(easeOutCubic(0.102040816327)).toBeCloseTo(0.275947946859, 5);
  });
  it('easeOutCubic(0.122448979592) ~ 0.324201650673', () => {
    expect(easeOutCubic(0.122448979592)).toBeCloseTo(0.324201650673, 5);
  });
  it('easeOutCubic(0.142857142857) ~ 0.370262390671', () => {
    expect(easeOutCubic(0.142857142857)).toBeCloseTo(0.370262390671, 5);
  });
  it('easeOutCubic(0.163265306122) ~ 0.414181166011', () => {
    expect(easeOutCubic(0.163265306122)).toBeCloseTo(0.414181166011, 5);
  });
  it('easeOutCubic(0.183673469388) ~ 0.456008975852', () => {
    expect(easeOutCubic(0.183673469388)).toBeCloseTo(0.456008975852, 5);
  });
  it('easeOutCubic(0.204081632653) ~ 0.495796819352', () => {
    expect(easeOutCubic(0.204081632653)).toBeCloseTo(0.495796819352, 5);
  });
  it('easeOutCubic(0.224489795918) ~ 0.533595695671', () => {
    expect(easeOutCubic(0.224489795918)).toBeCloseTo(0.533595695671, 5);
  });
  it('easeOutCubic(0.244897959184) ~ 0.569456603966', () => {
    expect(easeOutCubic(0.244897959184)).toBeCloseTo(0.569456603966, 5);
  });
  it('easeOutCubic(0.265306122449) ~ 0.603430543396', () => {
    expect(easeOutCubic(0.265306122449)).toBeCloseTo(0.603430543396, 5);
  });
  it('easeOutCubic(0.285714285714) ~ 0.63556851312', () => {
    expect(easeOutCubic(0.285714285714)).toBeCloseTo(0.63556851312, 5);
  });
  it('easeOutCubic(0.30612244898) ~ 0.665921512295', () => {
    expect(easeOutCubic(0.30612244898)).toBeCloseTo(0.665921512295, 5);
  });
  it('easeOutCubic(0.326530612245) ~ 0.694540540081', () => {
    expect(easeOutCubic(0.326530612245)).toBeCloseTo(0.694540540081, 5);
  });
  it('easeOutCubic(0.34693877551) ~ 0.721476595636', () => {
    expect(easeOutCubic(0.34693877551)).toBeCloseTo(0.721476595636, 5);
  });
  it('easeOutCubic(0.367346938776) ~ 0.746780678119', () => {
    expect(easeOutCubic(0.367346938776)).toBeCloseTo(0.746780678119, 5);
  });
  it('easeOutCubic(0.387755102041) ~ 0.770503786688', () => {
    expect(easeOutCubic(0.387755102041)).toBeCloseTo(0.770503786688, 5);
  });
  it('easeOutCubic(0.408163265306) ~ 0.792696920501', () => {
    expect(easeOutCubic(0.408163265306)).toBeCloseTo(0.792696920501, 5);
  });
  it('easeOutCubic(0.428571428571) ~ 0.813411078717', () => {
    expect(easeOutCubic(0.428571428571)).toBeCloseTo(0.813411078717, 5);
  });
  it('easeOutCubic(0.448979591837) ~ 0.832697260495', () => {
    expect(easeOutCubic(0.448979591837)).toBeCloseTo(0.832697260495, 5);
  });
  it('easeOutCubic(0.469387755102) ~ 0.850606464993', () => {
    expect(easeOutCubic(0.469387755102)).toBeCloseTo(0.850606464993, 5);
  });
  it('easeOutCubic(0.489795918367) ~ 0.86718969137', () => {
    expect(easeOutCubic(0.489795918367)).toBeCloseTo(0.86718969137, 5);
  });
  it('easeOutCubic(0.510204081633) ~ 0.882497938784', () => {
    expect(easeOutCubic(0.510204081633)).toBeCloseTo(0.882497938784, 5);
  });
  it('easeOutCubic(0.530612244898) ~ 0.896582206394', () => {
    expect(easeOutCubic(0.530612244898)).toBeCloseTo(0.896582206394, 5);
  });
  it('easeOutCubic(0.551020408163) ~ 0.909493493357', () => {
    expect(easeOutCubic(0.551020408163)).toBeCloseTo(0.909493493357, 5);
  });
  it('easeOutCubic(0.571428571429) ~ 0.921282798834', () => {
    expect(easeOutCubic(0.571428571429)).toBeCloseTo(0.921282798834, 5);
  });
  it('easeOutCubic(0.591836734694) ~ 0.932001121981', () => {
    expect(easeOutCubic(0.591836734694)).toBeCloseTo(0.932001121981, 5);
  });
  it('easeOutCubic(0.612244897959) ~ 0.941699461959', () => {
    expect(easeOutCubic(0.612244897959)).toBeCloseTo(0.941699461959, 5);
  });
  it('easeOutCubic(0.632653061224) ~ 0.950428817925', () => {
    expect(easeOutCubic(0.632653061224)).toBeCloseTo(0.950428817925, 5);
  });
  it('easeOutCubic(0.65306122449) ~ 0.958240189037', () => {
    expect(easeOutCubic(0.65306122449)).toBeCloseTo(0.958240189037, 5);
  });
  it('easeOutCubic(0.673469387755) ~ 0.965184574455', () => {
    expect(easeOutCubic(0.673469387755)).toBeCloseTo(0.965184574455, 5);
  });
  it('easeOutCubic(0.69387755102) ~ 0.971312973336', () => {
    expect(easeOutCubic(0.69387755102)).toBeCloseTo(0.971312973336, 5);
  });
  it('easeOutCubic(0.714285714286) ~ 0.97667638484', () => {
    expect(easeOutCubic(0.714285714286)).toBeCloseTo(0.97667638484, 5);
  });
  it('easeOutCubic(0.734693877551) ~ 0.981325808124', () => {
    expect(easeOutCubic(0.734693877551)).toBeCloseTo(0.981325808124, 5);
  });
  it('easeOutCubic(0.755102040816) ~ 0.985312242348', () => {
    expect(easeOutCubic(0.755102040816)).toBeCloseTo(0.985312242348, 5);
  });
  it('easeOutCubic(0.775510204082) ~ 0.98868668667', () => {
    expect(easeOutCubic(0.775510204082)).toBeCloseTo(0.98868668667, 5);
  });
  it('easeOutCubic(0.795918367347) ~ 0.991500140248', () => {
    expect(easeOutCubic(0.795918367347)).toBeCloseTo(0.991500140248, 5);
  });
  it('easeOutCubic(0.816326530612) ~ 0.993803602241', () => {
    expect(easeOutCubic(0.816326530612)).toBeCloseTo(0.993803602241, 5);
  });
  it('easeOutCubic(0.836734693878) ~ 0.995648071807', () => {
    expect(easeOutCubic(0.836734693878)).toBeCloseTo(0.995648071807, 5);
  });
  it('easeOutCubic(0.857142857143) ~ 0.997084548105', () => {
    expect(easeOutCubic(0.857142857143)).toBeCloseTo(0.997084548105, 5);
  });
  it('easeOutCubic(0.877551020408) ~ 0.998164030294', () => {
    expect(easeOutCubic(0.877551020408)).toBeCloseTo(0.998164030294, 5);
  });
  it('easeOutCubic(0.897959183673) ~ 0.998937517531', () => {
    expect(easeOutCubic(0.897959183673)).toBeCloseTo(0.998937517531, 5);
  });
  it('easeOutCubic(0.918367346939) ~ 0.999456008976', () => {
    expect(easeOutCubic(0.918367346939)).toBeCloseTo(0.999456008976, 5);
  });
  it('easeOutCubic(0.938775510204) ~ 0.999770503787', () => {
    expect(easeOutCubic(0.938775510204)).toBeCloseTo(0.999770503787, 5);
  });
  it('easeOutCubic(0.959183673469) ~ 0.999932001122', () => {
    expect(easeOutCubic(0.959183673469)).toBeCloseTo(0.999932001122, 5);
  });
  it('easeOutCubic(0.979591836735) ~ 0.99999150014', () => {
    expect(easeOutCubic(0.979591836735)).toBeCloseTo(0.99999150014, 5);
  });
  it('easeOutCubic(1) ~ 1', () => {
    expect(easeOutCubic(1)).toBeCloseTo(1, 5);
  });
});

describe('easeInOutCubic', () => {
  it('easeInOutCubic(0) ~ 0', () => {
    expect(easeInOutCubic(0)).toBeCloseTo(0, 5);
  });
  it('easeInOutCubic(0.020408163265) ~ 3.3999439e-05', () => {
    expect(easeInOutCubic(0.020408163265)).toBeCloseTo(3.3999439e-05, 5);
  });
  it('easeInOutCubic(0.040816326531) ~ 0.000271995512', () => {
    expect(easeInOutCubic(0.040816326531)).toBeCloseTo(0.000271995512, 5);
  });
  it('easeInOutCubic(0.061224489796) ~ 0.000917984853', () => {
    expect(easeInOutCubic(0.061224489796)).toBeCloseTo(0.000917984853, 5);
  });
  it('easeInOutCubic(0.081632653061) ~ 0.002175964097', () => {
    expect(easeInOutCubic(0.081632653061)).toBeCloseTo(0.002175964097, 5);
  });
  it('easeInOutCubic(0.102040816327) ~ 0.004249929876', () => {
    expect(easeInOutCubic(0.102040816327)).toBeCloseTo(0.004249929876, 5);
  });
  it('easeInOutCubic(0.122448979592) ~ 0.007343878826', () => {
    expect(easeInOutCubic(0.122448979592)).toBeCloseTo(0.007343878826, 5);
  });
  it('easeInOutCubic(0.142857142857) ~ 0.01166180758', () => {
    expect(easeInOutCubic(0.142857142857)).toBeCloseTo(0.01166180758, 5);
  });
  it('easeInOutCubic(0.163265306122) ~ 0.017407712773', () => {
    expect(easeInOutCubic(0.163265306122)).toBeCloseTo(0.017407712773, 5);
  });
  it('easeInOutCubic(0.183673469388) ~ 0.024785591038', () => {
    expect(easeInOutCubic(0.183673469388)).toBeCloseTo(0.024785591038, 5);
  });
  it('easeInOutCubic(0.204081632653) ~ 0.033999439009', () => {
    expect(easeInOutCubic(0.204081632653)).toBeCloseTo(0.033999439009, 5);
  });
  it('easeInOutCubic(0.224489795918) ~ 0.045253253321', () => {
    expect(easeInOutCubic(0.224489795918)).toBeCloseTo(0.045253253321, 5);
  });
  it('easeInOutCubic(0.244897959184) ~ 0.058751030608', () => {
    expect(easeInOutCubic(0.244897959184)).toBeCloseTo(0.058751030608, 5);
  });
  it('easeInOutCubic(0.265306122449) ~ 0.074696767503', () => {
    expect(easeInOutCubic(0.265306122449)).toBeCloseTo(0.074696767503, 5);
  });
  it('easeInOutCubic(0.285714285714) ~ 0.093294460641', () => {
    expect(easeInOutCubic(0.285714285714)).toBeCloseTo(0.093294460641, 5);
  });
  it('easeInOutCubic(0.30612244898) ~ 0.114748106656', () => {
    expect(easeInOutCubic(0.30612244898)).toBeCloseTo(0.114748106656, 5);
  });
  it('easeInOutCubic(0.326530612245) ~ 0.139261702182', () => {
    expect(easeInOutCubic(0.326530612245)).toBeCloseTo(0.139261702182, 5);
  });
  it('easeInOutCubic(0.34693877551) ~ 0.167039243852', () => {
    expect(easeInOutCubic(0.34693877551)).toBeCloseTo(0.167039243852, 5);
  });
  it('easeInOutCubic(0.367346938776) ~ 0.198284728302', () => {
    expect(easeInOutCubic(0.367346938776)).toBeCloseTo(0.198284728302, 5);
  });
  it('easeInOutCubic(0.387755102041) ~ 0.233202152164', () => {
    expect(easeInOutCubic(0.387755102041)).toBeCloseTo(0.233202152164, 5);
  });
  it('easeInOutCubic(0.408163265306) ~ 0.271995512074', () => {
    expect(easeInOutCubic(0.408163265306)).toBeCloseTo(0.271995512074, 5);
  });
  it('easeInOutCubic(0.428571428571) ~ 0.314868804665', () => {
    expect(easeInOutCubic(0.428571428571)).toBeCloseTo(0.314868804665, 5);
  });
  it('easeInOutCubic(0.448979591837) ~ 0.362026026571', () => {
    expect(easeInOutCubic(0.448979591837)).toBeCloseTo(0.362026026571, 5);
  });
  it('easeInOutCubic(0.469387755102) ~ 0.413671174426', () => {
    expect(easeInOutCubic(0.469387755102)).toBeCloseTo(0.413671174426, 5);
  });
  it('easeInOutCubic(0.489795918367) ~ 0.470008244864', () => {
    expect(easeInOutCubic(0.489795918367)).toBeCloseTo(0.470008244864, 5);
  });
  it('easeInOutCubic(0.510204081633) ~ 0.529991755136', () => {
    expect(easeInOutCubic(0.510204081633)).toBeCloseTo(0.529991755136, 5);
  });
  it('easeInOutCubic(0.530612244898) ~ 0.586328825574', () => {
    expect(easeInOutCubic(0.530612244898)).toBeCloseTo(0.586328825574, 5);
  });
  it('easeInOutCubic(0.551020408163) ~ 0.637973973429', () => {
    expect(easeInOutCubic(0.551020408163)).toBeCloseTo(0.637973973429, 5);
  });
  it('easeInOutCubic(0.571428571429) ~ 0.685131195335', () => {
    expect(easeInOutCubic(0.571428571429)).toBeCloseTo(0.685131195335, 5);
  });
  it('easeInOutCubic(0.591836734694) ~ 0.728004487926', () => {
    expect(easeInOutCubic(0.591836734694)).toBeCloseTo(0.728004487926, 5);
  });
  it('easeInOutCubic(0.612244897959) ~ 0.766797847836', () => {
    expect(easeInOutCubic(0.612244897959)).toBeCloseTo(0.766797847836, 5);
  });
  it('easeInOutCubic(0.632653061224) ~ 0.801715271698', () => {
    expect(easeInOutCubic(0.632653061224)).toBeCloseTo(0.801715271698, 5);
  });
  it('easeInOutCubic(0.65306122449) ~ 0.832960756148', () => {
    expect(easeInOutCubic(0.65306122449)).toBeCloseTo(0.832960756148, 5);
  });
  it('easeInOutCubic(0.673469387755) ~ 0.860738297818', () => {
    expect(easeInOutCubic(0.673469387755)).toBeCloseTo(0.860738297818, 5);
  });
  it('easeInOutCubic(0.69387755102) ~ 0.885251893344', () => {
    expect(easeInOutCubic(0.69387755102)).toBeCloseTo(0.885251893344, 5);
  });
  it('easeInOutCubic(0.714285714286) ~ 0.906705539359', () => {
    expect(easeInOutCubic(0.714285714286)).toBeCloseTo(0.906705539359, 5);
  });
  it('easeInOutCubic(0.734693877551) ~ 0.925303232497', () => {
    expect(easeInOutCubic(0.734693877551)).toBeCloseTo(0.925303232497, 5);
  });
  it('easeInOutCubic(0.755102040816) ~ 0.941248969392', () => {
    expect(easeInOutCubic(0.755102040816)).toBeCloseTo(0.941248969392, 5);
  });
  it('easeInOutCubic(0.775510204082) ~ 0.954746746679', () => {
    expect(easeInOutCubic(0.775510204082)).toBeCloseTo(0.954746746679, 5);
  });
  it('easeInOutCubic(0.795918367347) ~ 0.966000560991', () => {
    expect(easeInOutCubic(0.795918367347)).toBeCloseTo(0.966000560991, 5);
  });
  it('easeInOutCubic(0.816326530612) ~ 0.975214408962', () => {
    expect(easeInOutCubic(0.816326530612)).toBeCloseTo(0.975214408962, 5);
  });
  it('easeInOutCubic(0.836734693878) ~ 0.982592287227', () => {
    expect(easeInOutCubic(0.836734693878)).toBeCloseTo(0.982592287227, 5);
  });
  it('easeInOutCubic(0.857142857143) ~ 0.98833819242', () => {
    expect(easeInOutCubic(0.857142857143)).toBeCloseTo(0.98833819242, 5);
  });
  it('easeInOutCubic(0.877551020408) ~ 0.992656121174', () => {
    expect(easeInOutCubic(0.877551020408)).toBeCloseTo(0.992656121174, 5);
  });
  it('easeInOutCubic(0.897959183673) ~ 0.995750070124', () => {
    expect(easeInOutCubic(0.897959183673)).toBeCloseTo(0.995750070124, 5);
  });
  it('easeInOutCubic(0.918367346939) ~ 0.997824035903', () => {
    expect(easeInOutCubic(0.918367346939)).toBeCloseTo(0.997824035903, 5);
  });
  it('easeInOutCubic(0.938775510204) ~ 0.999082015147', () => {
    expect(easeInOutCubic(0.938775510204)).toBeCloseTo(0.999082015147, 5);
  });
  it('easeInOutCubic(0.959183673469) ~ 0.999728004488', () => {
    expect(easeInOutCubic(0.959183673469)).toBeCloseTo(0.999728004488, 5);
  });
  it('easeInOutCubic(0.979591836735) ~ 0.999966000561', () => {
    expect(easeInOutCubic(0.979591836735)).toBeCloseTo(0.999966000561, 5);
  });
  it('easeInOutCubic(1) ~ 1', () => {
    expect(easeInOutCubic(1)).toBeCloseTo(1, 5);
  });
});

describe('easeInSine', () => {
  it('easeInSine(0) ~ 0', () => {
    expect(easeInSine(0)).toBeCloseTo(0, 5);
  });
  it('easeInSine(0.020408163265) ~ 0.000513783799', () => {
    expect(easeInSine(0.020408163265)).toBeCloseTo(0.000513783799, 5);
  });
  it('easeInSine(0.040816326531) ~ 0.00205460725', () => {
    expect(easeInSine(0.040816326531)).toBeCloseTo(0.00205460725, 5);
  });
  it('easeInSine(0.061224489796) ~ 0.004620887051', () => {
    expect(easeInSine(0.061224489796)).toBeCloseTo(0.004620887051, 5);
  });
  it('easeInSine(0.081632653061) ~ 0.008209986177', () => {
    expect(easeInSine(0.081632653061)).toBeCloseTo(0.008209986177, 5);
  });
  it('easeInSine(0.102040816327) ~ 0.012818216586', () => {
    expect(easeInSine(0.102040816327)).toBeCloseTo(0.012818216586, 5);
  });
  it('easeInSine(0.122448979592) ~ 0.018440843009', () => {
    expect(easeInSine(0.122448979592)).toBeCloseTo(0.018440843009, 5);
  });
  it('easeInSine(0.142857142857) ~ 0.025072087818', () => {
    expect(easeInSine(0.142857142857)).toBeCloseTo(0.025072087818, 5);
  });
  it('easeInSine(0.163265306122) ~ 0.032705136961', () => {
    expect(easeInSine(0.163265306122)).toBeCloseTo(0.032705136961, 5);
  });
  it('easeInSine(0.183673469388) ~ 0.041332146963', () => {
    expect(easeInSine(0.183673469388)).toBeCloseTo(0.041332146963, 5);
  });
  it('easeInSine(0.204081632653) ~ 0.050944252989', () => {
    expect(easeInSine(0.204081632653)).toBeCloseTo(0.050944252989, 5);
  });
  it('easeInSine(0.224489795918) ~ 0.06153157795', () => {
    expect(easeInSine(0.224489795918)).toBeCloseTo(0.06153157795, 5);
  });
  it('easeInSine(0.244897959184) ~ 0.073083242654', () => {
    expect(easeInSine(0.244897959184)).toBeCloseTo(0.073083242654, 5);
  });
  it('easeInSine(0.265306122449) ~ 0.085587376984', () => {
    expect(easeInSine(0.265306122449)).toBeCloseTo(0.085587376984, 5);
  });
  it('easeInSine(0.285714285714) ~ 0.099031132098', () => {
    expect(easeInSine(0.285714285714)).toBeCloseTo(0.099031132098, 5);
  });
  it('easeInSine(0.30612244898) ~ 0.113400693627', () => {
    expect(easeInSine(0.30612244898)).toBeCloseTo(0.113400693627, 5);
  });
  it('easeInSine(0.326530612245) ~ 0.128681295877', () => {
    expect(easeInSine(0.326530612245)).toBeCloseTo(0.128681295877, 5);
  });
  it('easeInSine(0.34693877551) ~ 0.144857236995', () => {
    expect(easeInSine(0.34693877551)).toBeCloseTo(0.144857236995, 5);
  });
  it('easeInSine(0.367346938776) ~ 0.161911895108', () => {
    expect(easeInSine(0.367346938776)).toBeCloseTo(0.161911895108, 5);
  });
  it('easeInSine(0.387755102041) ~ 0.179827745403', () => {
    expect(easeInSine(0.387755102041)).toBeCloseTo(0.179827745403, 5);
  });
  it('easeInSine(0.408163265306) ~ 0.198586378132', () => {
    expect(easeInSine(0.408163265306)).toBeCloseTo(0.198586378132, 5);
  });
  it('easeInSine(0.428571428571) ~ 0.218168517532', () => {
    expect(easeInSine(0.428571428571)).toBeCloseTo(0.218168517532, 5);
  });
  it('easeInSine(0.448979591837) ~ 0.238554041631', () => {
    expect(easeInSine(0.448979591837)).toBeCloseTo(0.238554041631, 5);
  });
  it('easeInSine(0.469387755102) ~ 0.259722002925', () => {
    expect(easeInSine(0.469387755102)).toBeCloseTo(0.259722002925, 5);
  });
  it('easeInSine(0.489795918367) ~ 0.281650649902', () => {
    expect(easeInSine(0.489795918367)).toBeCloseTo(0.281650649902, 5);
  });
  it('easeInSine(0.510204081633) ~ 0.304317449397', () => {
    expect(easeInSine(0.510204081633)).toBeCloseTo(0.304317449397, 5);
  });
  it('easeInSine(0.530612244898) ~ 0.327699109739', () => {
    expect(easeInSine(0.530612244898)).toBeCloseTo(0.327699109739, 5);
  });
  it('easeInSine(0.551020408163) ~ 0.351771604692', () => {
    expect(easeInSine(0.551020408163)).toBeCloseTo(0.351771604692, 5);
  });
  it('easeInSine(0.571428571429) ~ 0.376510198141', () => {
    expect(easeInSine(0.571428571429)).toBeCloseTo(0.376510198141, 5);
  });
  it('easeInSine(0.591836734694) ~ 0.401889469509', () => {
    expect(easeInSine(0.591836734694)).toBeCloseTo(0.401889469509, 5);
  });
  it('easeInSine(0.612244897959) ~ 0.427883339878', () => {
    expect(easeInSine(0.612244897959)).toBeCloseTo(0.427883339878, 5);
  });
  it('easeInSine(0.632653061224) ~ 0.454465098789', () => {
    expect(easeInSine(0.632653061224)).toBeCloseTo(0.454465098789, 5);
  });
  it('easeInSine(0.65306122449) ~ 0.481607431689', () => {
    expect(easeInSine(0.65306122449)).toBeCloseTo(0.481607431689, 5);
  });
  it('easeInSine(0.673469387755) ~ 0.509282447996', () => {
    expect(easeInSine(0.673469387755)).toBeCloseTo(0.509282447996, 5);
  });
  it('easeInSine(0.69387755102) ~ 0.537461709759', () => {
    expect(easeInSine(0.69387755102)).toBeCloseTo(0.537461709759, 5);
  });
  it('easeInSine(0.714285714286) ~ 0.566116260882', () => {
    expect(easeInSine(0.714285714286)).toBeCloseTo(0.566116260882, 5);
  });
  it('easeInSine(0.734693877551) ~ 0.595216656878', () => {
    expect(easeInSine(0.734693877551)).toBeCloseTo(0.595216656878, 5);
  });
  it('easeInSine(0.755102040816) ~ 0.624732995121', () => {
    expect(easeInSine(0.755102040816)).toBeCloseTo(0.624732995121, 5);
  });
  it('easeInSine(0.775510204082) ~ 0.654634945579', () => {
    expect(easeInSine(0.775510204082)).toBeCloseTo(0.654634945579, 5);
  });
  it('easeInSine(0.795918367347) ~ 0.684891781976', () => {
    expect(easeInSine(0.795918367347)).toBeCloseTo(0.684891781976, 5);
  });
  it('easeInSine(0.816326530612) ~ 0.715472413369', () => {
    expect(easeInSine(0.816326530612)).toBeCloseTo(0.715472413369, 5);
  });
  it('easeInSine(0.836734693878) ~ 0.74634541609', () => {
    expect(easeInSine(0.836734693878)).toBeCloseTo(0.74634541609, 5);
  });
  it('easeInSine(0.857142857143) ~ 0.777479066044', () => {
    expect(easeInSine(0.857142857143)).toBeCloseTo(0.777479066044, 5);
  });
  it('easeInSine(0.877551020408) ~ 0.808841371299', () => {
    expect(easeInSine(0.877551020408)).toBeCloseTo(0.808841371299, 5);
  });
  it('easeInSine(0.897959183673) ~ 0.840400104967', () => {
    expect(easeInSine(0.897959183673)).toBeCloseTo(0.840400104967, 5);
  });
  it('easeInSine(0.918367346939) ~ 0.872122838315', () => {
    expect(easeInSine(0.918367346939)).toBeCloseTo(0.872122838315, 5);
  });
  it('easeInSine(0.938775510204) ~ 0.903976974092', () => {
    expect(easeInSine(0.938775510204)).toBeCloseTo(0.903976974092, 5);
  });
  it('easeInSine(0.959183673469) ~ 0.935929780019', () => {
    expect(easeInSine(0.959183673469)).toBeCloseTo(0.935929780019, 5);
  });
  it('easeInSine(0.979591836735) ~ 0.967948422428', () => {
    expect(easeInSine(0.979591836735)).toBeCloseTo(0.967948422428, 5);
  });
  it('easeInSine(1) ~ 1.0', () => {
    expect(easeInSine(1)).toBeCloseTo(1.0, 5);
  });
});

describe('easeOutSine', () => {
  it('easeOutSine(0) ~ 0', () => {
    expect(easeOutSine(0)).toBeCloseTo(0, 5);
  });
  it('easeOutSine(0.020408163265) ~ 0.032051577572', () => {
    expect(easeOutSine(0.020408163265)).toBeCloseTo(0.032051577572, 5);
  });
  it('easeOutSine(0.040816326531) ~ 0.064070219981', () => {
    expect(easeOutSine(0.040816326531)).toBeCloseTo(0.064070219981, 5);
  });
  it('easeOutSine(0.061224489796) ~ 0.096023025908', () => {
    expect(easeOutSine(0.061224489796)).toBeCloseTo(0.096023025908, 5);
  });
  it('easeOutSine(0.081632653061) ~ 0.127877161685', () => {
    expect(easeOutSine(0.081632653061)).toBeCloseTo(0.127877161685, 5);
  });
  it('easeOutSine(0.102040816327) ~ 0.159599895033', () => {
    expect(easeOutSine(0.102040816327)).toBeCloseTo(0.159599895033, 5);
  });
  it('easeOutSine(0.122448979592) ~ 0.191158628701', () => {
    expect(easeOutSine(0.122448979592)).toBeCloseTo(0.191158628701, 5);
  });
  it('easeOutSine(0.142857142857) ~ 0.222520933956', () => {
    expect(easeOutSine(0.142857142857)).toBeCloseTo(0.222520933956, 5);
  });
  it('easeOutSine(0.163265306122) ~ 0.25365458391', () => {
    expect(easeOutSine(0.163265306122)).toBeCloseTo(0.25365458391, 5);
  });
  it('easeOutSine(0.183673469388) ~ 0.284527586631', () => {
    expect(easeOutSine(0.183673469388)).toBeCloseTo(0.284527586631, 5);
  });
  it('easeOutSine(0.204081632653) ~ 0.315108218024', () => {
    expect(easeOutSine(0.204081632653)).toBeCloseTo(0.315108218024, 5);
  });
  it('easeOutSine(0.224489795918) ~ 0.345365054421', () => {
    expect(easeOutSine(0.224489795918)).toBeCloseTo(0.345365054421, 5);
  });
  it('easeOutSine(0.244897959184) ~ 0.375267004879', () => {
    expect(easeOutSine(0.244897959184)).toBeCloseTo(0.375267004879, 5);
  });
  it('easeOutSine(0.265306122449) ~ 0.404783343122', () => {
    expect(easeOutSine(0.265306122449)).toBeCloseTo(0.404783343122, 5);
  });
  it('easeOutSine(0.285714285714) ~ 0.433883739118', () => {
    expect(easeOutSine(0.285714285714)).toBeCloseTo(0.433883739118, 5);
  });
  it('easeOutSine(0.30612244898) ~ 0.462538290241', () => {
    expect(easeOutSine(0.30612244898)).toBeCloseTo(0.462538290241, 5);
  });
  it('easeOutSine(0.326530612245) ~ 0.490717552004', () => {
    expect(easeOutSine(0.326530612245)).toBeCloseTo(0.490717552004, 5);
  });
  it('easeOutSine(0.34693877551) ~ 0.518392568311', () => {
    expect(easeOutSine(0.34693877551)).toBeCloseTo(0.518392568311, 5);
  });
  it('easeOutSine(0.367346938776) ~ 0.545534901211', () => {
    expect(easeOutSine(0.367346938776)).toBeCloseTo(0.545534901211, 5);
  });
  it('easeOutSine(0.387755102041) ~ 0.572116660122', () => {
    expect(easeOutSine(0.387755102041)).toBeCloseTo(0.572116660122, 5);
  });
  it('easeOutSine(0.408163265306) ~ 0.598110530491', () => {
    expect(easeOutSine(0.408163265306)).toBeCloseTo(0.598110530491, 5);
  });
  it('easeOutSine(0.428571428571) ~ 0.623489801859', () => {
    expect(easeOutSine(0.428571428571)).toBeCloseTo(0.623489801859, 5);
  });
  it('easeOutSine(0.448979591837) ~ 0.648228395308', () => {
    expect(easeOutSine(0.448979591837)).toBeCloseTo(0.648228395308, 5);
  });
  it('easeOutSine(0.469387755102) ~ 0.672300890261', () => {
    expect(easeOutSine(0.469387755102)).toBeCloseTo(0.672300890261, 5);
  });
  it('easeOutSine(0.489795918367) ~ 0.695682550603', () => {
    expect(easeOutSine(0.489795918367)).toBeCloseTo(0.695682550603, 5);
  });
  it('easeOutSine(0.510204081633) ~ 0.718349350098', () => {
    expect(easeOutSine(0.510204081633)).toBeCloseTo(0.718349350098, 5);
  });
  it('easeOutSine(0.530612244898) ~ 0.740277997075', () => {
    expect(easeOutSine(0.530612244898)).toBeCloseTo(0.740277997075, 5);
  });
  it('easeOutSine(0.551020408163) ~ 0.761445958369', () => {
    expect(easeOutSine(0.551020408163)).toBeCloseTo(0.761445958369, 5);
  });
  it('easeOutSine(0.571428571429) ~ 0.781831482468', () => {
    expect(easeOutSine(0.571428571429)).toBeCloseTo(0.781831482468, 5);
  });
  it('easeOutSine(0.591836734694) ~ 0.801413621868', () => {
    expect(easeOutSine(0.591836734694)).toBeCloseTo(0.801413621868, 5);
  });
  it('easeOutSine(0.612244897959) ~ 0.820172254597', () => {
    expect(easeOutSine(0.612244897959)).toBeCloseTo(0.820172254597, 5);
  });
  it('easeOutSine(0.632653061224) ~ 0.838088104892', () => {
    expect(easeOutSine(0.632653061224)).toBeCloseTo(0.838088104892, 5);
  });
  it('easeOutSine(0.65306122449) ~ 0.855142763005', () => {
    expect(easeOutSine(0.65306122449)).toBeCloseTo(0.855142763005, 5);
  });
  it('easeOutSine(0.673469387755) ~ 0.871318704123', () => {
    expect(easeOutSine(0.673469387755)).toBeCloseTo(0.871318704123, 5);
  });
  it('easeOutSine(0.69387755102) ~ 0.886599306373', () => {
    expect(easeOutSine(0.69387755102)).toBeCloseTo(0.886599306373, 5);
  });
  it('easeOutSine(0.714285714286) ~ 0.900968867902', () => {
    expect(easeOutSine(0.714285714286)).toBeCloseTo(0.900968867902, 5);
  });
  it('easeOutSine(0.734693877551) ~ 0.914412623016', () => {
    expect(easeOutSine(0.734693877551)).toBeCloseTo(0.914412623016, 5);
  });
  it('easeOutSine(0.755102040816) ~ 0.926916757346', () => {
    expect(easeOutSine(0.755102040816)).toBeCloseTo(0.926916757346, 5);
  });
  it('easeOutSine(0.775510204082) ~ 0.93846842205', () => {
    expect(easeOutSine(0.775510204082)).toBeCloseTo(0.93846842205, 5);
  });
  it('easeOutSine(0.795918367347) ~ 0.949055747011', () => {
    expect(easeOutSine(0.795918367347)).toBeCloseTo(0.949055747011, 5);
  });
  it('easeOutSine(0.816326530612) ~ 0.958667853037', () => {
    expect(easeOutSine(0.816326530612)).toBeCloseTo(0.958667853037, 5);
  });
  it('easeOutSine(0.836734693878) ~ 0.967294863039', () => {
    expect(easeOutSine(0.836734693878)).toBeCloseTo(0.967294863039, 5);
  });
  it('easeOutSine(0.857142857143) ~ 0.974927912182', () => {
    expect(easeOutSine(0.857142857143)).toBeCloseTo(0.974927912182, 5);
  });
  it('easeOutSine(0.877551020408) ~ 0.981559156991', () => {
    expect(easeOutSine(0.877551020408)).toBeCloseTo(0.981559156991, 5);
  });
  it('easeOutSine(0.897959183673) ~ 0.987181783414', () => {
    expect(easeOutSine(0.897959183673)).toBeCloseTo(0.987181783414, 5);
  });
  it('easeOutSine(0.918367346939) ~ 0.991790013823', () => {
    expect(easeOutSine(0.918367346939)).toBeCloseTo(0.991790013823, 5);
  });
  it('easeOutSine(0.938775510204) ~ 0.995379112949', () => {
    expect(easeOutSine(0.938775510204)).toBeCloseTo(0.995379112949, 5);
  });
  it('easeOutSine(0.959183673469) ~ 0.99794539275', () => {
    expect(easeOutSine(0.959183673469)).toBeCloseTo(0.99794539275, 5);
  });
  it('easeOutSine(0.979591836735) ~ 0.999486216201', () => {
    expect(easeOutSine(0.979591836735)).toBeCloseTo(0.999486216201, 5);
  });
  it('easeOutSine(1) ~ 1', () => {
    expect(easeOutSine(1)).toBeCloseTo(1, 5);
  });
});

describe('easeInOutSine', () => {
  it('easeInOutSine(0) ~ 0', () => {
    expect(easeInOutSine(0)).toBeCloseTo(0, 5);
  });
  it('easeInOutSine(0.020408163265) ~ 0.001027303625', () => {
    expect(easeInOutSine(0.020408163265)).toBeCloseTo(0.001027303625, 5);
  });
  it('easeInOutSine(0.040816326531) ~ 0.004104993088', () => {
    expect(easeInOutSine(0.040816326531)).toBeCloseTo(0.004104993088, 5);
  });
  it('easeInOutSine(0.061224489796) ~ 0.009220421504', () => {
    expect(easeInOutSine(0.061224489796)).toBeCloseTo(0.009220421504, 5);
  });
  it('easeInOutSine(0.081632653061) ~ 0.01635256848', () => {
    expect(easeInOutSine(0.081632653061)).toBeCloseTo(0.01635256848, 5);
  });
  it('easeInOutSine(0.102040816327) ~ 0.025472126495', () => {
    expect(easeInOutSine(0.102040816327)).toBeCloseTo(0.025472126495, 5);
  });
  it('easeInOutSine(0.122448979592) ~ 0.036541621327', () => {
    expect(easeInOutSine(0.122448979592)).toBeCloseTo(0.036541621327, 5);
  });
  it('easeInOutSine(0.142857142857) ~ 0.049515566049', () => {
    expect(easeInOutSine(0.142857142857)).toBeCloseTo(0.049515566049, 5);
  });
  it('easeInOutSine(0.163265306122) ~ 0.064340647938', () => {
    expect(easeInOutSine(0.163265306122)).toBeCloseTo(0.064340647938, 5);
  });
  it('easeInOutSine(0.183673469388) ~ 0.080955947554', () => {
    expect(easeInOutSine(0.183673469388)).toBeCloseTo(0.080955947554, 5);
  });
  it('easeInOutSine(0.204081632653) ~ 0.099293189066', () => {
    expect(easeInOutSine(0.204081632653)).toBeCloseTo(0.099293189066, 5);
  });
  it('easeInOutSine(0.224489795918) ~ 0.119277020815', () => {
    expect(easeInOutSine(0.224489795918)).toBeCloseTo(0.119277020815, 5);
  });
  it('easeInOutSine(0.244897959184) ~ 0.140825324951', () => {
    expect(easeInOutSine(0.244897959184)).toBeCloseTo(0.140825324951, 5);
  });
  it('easeInOutSine(0.265306122449) ~ 0.163849554869', () => {
    expect(easeInOutSine(0.265306122449)).toBeCloseTo(0.163849554869, 5);
  });
  it('easeInOutSine(0.285714285714) ~ 0.188255099071', () => {
    expect(easeInOutSine(0.285714285714)).toBeCloseTo(0.188255099071, 5);
  });
  it('easeInOutSine(0.30612244898) ~ 0.213941669939', () => {
    expect(easeInOutSine(0.30612244898)).toBeCloseTo(0.213941669939, 5);
  });
  it('easeInOutSine(0.326530612245) ~ 0.240803715845', () => {
    expect(easeInOutSine(0.326530612245)).toBeCloseTo(0.240803715845, 5);
  });
  it('easeInOutSine(0.34693877551) ~ 0.26873085488', () => {
    expect(easeInOutSine(0.34693877551)).toBeCloseTo(0.26873085488, 5);
  });
  it('easeInOutSine(0.367346938776) ~ 0.297608328439', () => {
    expect(easeInOutSine(0.367346938776)).toBeCloseTo(0.297608328439, 5);
  });
  it('easeInOutSine(0.387755102041) ~ 0.327317472789', () => {
    expect(easeInOutSine(0.387755102041)).toBeCloseTo(0.327317472789, 5);
  });
  it('easeInOutSine(0.408163265306) ~ 0.357736206684', () => {
    expect(easeInOutSine(0.408163265306)).toBeCloseTo(0.357736206684, 5);
  });
  it('easeInOutSine(0.428571428571) ~ 0.388739533022', () => {
    expect(easeInOutSine(0.428571428571)).toBeCloseTo(0.388739533022, 5);
  });
  it('easeInOutSine(0.448979591837) ~ 0.420200052483', () => {
    expect(easeInOutSine(0.448979591837)).toBeCloseTo(0.420200052483, 5);
  });
  it('easeInOutSine(0.469387755102) ~ 0.451988487046', () => {
    expect(easeInOutSine(0.469387755102)).toBeCloseTo(0.451988487046, 5);
  });
  it('easeInOutSine(0.489795918367) ~ 0.483974211214', () => {
    expect(easeInOutSine(0.489795918367)).toBeCloseTo(0.483974211214, 5);
  });
  it('easeInOutSine(0.510204081633) ~ 0.516025788786', () => {
    expect(easeInOutSine(0.510204081633)).toBeCloseTo(0.516025788786, 5);
  });
  it('easeInOutSine(0.530612244898) ~ 0.548011512954', () => {
    expect(easeInOutSine(0.530612244898)).toBeCloseTo(0.548011512954, 5);
  });
  it('easeInOutSine(0.551020408163) ~ 0.579799947517', () => {
    expect(easeInOutSine(0.551020408163)).toBeCloseTo(0.579799947517, 5);
  });
  it('easeInOutSine(0.571428571429) ~ 0.611260466978', () => {
    expect(easeInOutSine(0.571428571429)).toBeCloseTo(0.611260466978, 5);
  });
  it('easeInOutSine(0.591836734694) ~ 0.642263793316', () => {
    expect(easeInOutSine(0.591836734694)).toBeCloseTo(0.642263793316, 5);
  });
  it('easeInOutSine(0.612244897959) ~ 0.672682527211', () => {
    expect(easeInOutSine(0.612244897959)).toBeCloseTo(0.672682527211, 5);
  });
  it('easeInOutSine(0.632653061224) ~ 0.702391671561', () => {
    expect(easeInOutSine(0.632653061224)).toBeCloseTo(0.702391671561, 5);
  });
  it('easeInOutSine(0.65306122449) ~ 0.73126914512', () => {
    expect(easeInOutSine(0.65306122449)).toBeCloseTo(0.73126914512, 5);
  });
  it('easeInOutSine(0.673469387755) ~ 0.759196284155', () => {
    expect(easeInOutSine(0.673469387755)).toBeCloseTo(0.759196284155, 5);
  });
  it('easeInOutSine(0.69387755102) ~ 0.786058330061', () => {
    expect(easeInOutSine(0.69387755102)).toBeCloseTo(0.786058330061, 5);
  });
  it('easeInOutSine(0.714285714286) ~ 0.811744900929', () => {
    expect(easeInOutSine(0.714285714286)).toBeCloseTo(0.811744900929, 5);
  });
  it('easeInOutSine(0.734693877551) ~ 0.836150445131', () => {
    expect(easeInOutSine(0.734693877551)).toBeCloseTo(0.836150445131, 5);
  });
  it('easeInOutSine(0.755102040816) ~ 0.859174675049', () => {
    expect(easeInOutSine(0.755102040816)).toBeCloseTo(0.859174675049, 5);
  });
  it('easeInOutSine(0.775510204082) ~ 0.880722979185', () => {
    expect(easeInOutSine(0.775510204082)).toBeCloseTo(0.880722979185, 5);
  });
  it('easeInOutSine(0.795918367347) ~ 0.900706810934', () => {
    expect(easeInOutSine(0.795918367347)).toBeCloseTo(0.900706810934, 5);
  });
  it('easeInOutSine(0.816326530612) ~ 0.919044052446', () => {
    expect(easeInOutSine(0.816326530612)).toBeCloseTo(0.919044052446, 5);
  });
  it('easeInOutSine(0.836734693878) ~ 0.935659352062', () => {
    expect(easeInOutSine(0.836734693878)).toBeCloseTo(0.935659352062, 5);
  });
  it('easeInOutSine(0.857142857143) ~ 0.950484433951', () => {
    expect(easeInOutSine(0.857142857143)).toBeCloseTo(0.950484433951, 5);
  });
  it('easeInOutSine(0.877551020408) ~ 0.963458378673', () => {
    expect(easeInOutSine(0.877551020408)).toBeCloseTo(0.963458378673, 5);
  });
  it('easeInOutSine(0.897959183673) ~ 0.974527873505', () => {
    expect(easeInOutSine(0.897959183673)).toBeCloseTo(0.974527873505, 5);
  });
  it('easeInOutSine(0.918367346939) ~ 0.98364743152', () => {
    expect(easeInOutSine(0.918367346939)).toBeCloseTo(0.98364743152, 5);
  });
  it('easeInOutSine(0.938775510204) ~ 0.990779578496', () => {
    expect(easeInOutSine(0.938775510204)).toBeCloseTo(0.990779578496, 5);
  });
  it('easeInOutSine(0.959183673469) ~ 0.995895006912', () => {
    expect(easeInOutSine(0.959183673469)).toBeCloseTo(0.995895006912, 5);
  });
  it('easeInOutSine(0.979591836735) ~ 0.998972696375', () => {
    expect(easeInOutSine(0.979591836735)).toBeCloseTo(0.998972696375, 5);
  });
  it('easeInOutSine(1) ~ 1', () => {
    expect(easeInOutSine(1)).toBeCloseTo(1, 5);
  });
});

describe('easeInExpo', () => {
  it('easeInExpo(0) === 0', () => { expect(easeInExpo(0)).toBe(0); });
  it('easeInExpo(1) === 1', () => { expect(easeInExpo(1)).toBeCloseTo(1, 5); });
  it('easeInExpo(0.020408163265) ~ 0.001124953928', () => {
    expect(easeInExpo(0.020408163265)).toBeCloseTo(0.001124953928, 5);
  });
  it('easeInExpo(0.040816326531) ~ 0.001295893852', () => {
    expect(easeInExpo(0.040816326531)).toBeCloseTo(0.001295893852, 5);
  });
  it('easeInExpo(0.061224489796) ~ 0.001492808579', () => {
    expect(easeInExpo(0.061224489796)).toBeCloseTo(0.001492808579, 5);
  });
  it('easeInExpo(0.081632653061) ~ 0.001719645056', () => {
    expect(easeInExpo(0.081632653061)).toBeCloseTo(0.001719645056, 5);
  });
  it('easeInExpo(0.102040816327) ~ 0.001980949975', () => {
    expect(easeInExpo(0.102040816327)).toBeCloseTo(0.001980949975, 5);
  });
  it('easeInExpo(0.122448979592) ~ 0.002281960913', () => {
    expect(easeInExpo(0.122448979592)).toBeCloseTo(0.002281960913, 5);
  });
  it('easeInExpo(0.142857142857) ~ 0.002628711314', () => {
    expect(easeInExpo(0.142857142857)).toBeCloseTo(0.002628711314, 5);
  });
  it('easeInExpo(0.163265306122) ~ 0.003028151416', () => {
    expect(easeInExpo(0.163265306122)).toBeCloseTo(0.003028151416, 5);
  });
  it('easeInExpo(0.183673469388) ~ 0.003488287569', () => {
    expect(easeInExpo(0.183673469388)).toBeCloseTo(0.003488287569, 5);
  });
  it('easeInExpo(0.204081632653) ~ 0.004018342709', () => {
    expect(easeInExpo(0.204081632653)).toBeCloseTo(0.004018342709, 5);
  });
  it('easeInExpo(0.224489795918) ~ 0.004628941223', () => {
    expect(easeInExpo(0.224489795918)).toBeCloseTo(0.004628941223, 5);
  });
  it('easeInExpo(0.244897959184) ~ 0.005332321905', () => {
    expect(easeInExpo(0.244897959184)).toBeCloseTo(0.005332321905, 5);
  });
  it('easeInExpo(0.265306122449) ~ 0.006142583266', () => {
    expect(easeInExpo(0.265306122449)).toBeCloseTo(0.006142583266, 5);
  });
  it('easeInExpo(0.285714285714) ~ 0.007075966127', () => {
    expect(easeInExpo(0.285714285714)).toBeCloseTo(0.007075966127, 5);
  });
  it('easeInExpo(0.30612244898) ~ 0.008151179148', () => {
    expect(easeInExpo(0.30612244898)).toBeCloseTo(0.008151179148, 5);
  });
  it('easeInExpo(0.326530612245) ~ 0.009389773822', () => {
    expect(easeInExpo(0.326530612245)).toBeCloseTo(0.009389773822, 5);
  });
  it('easeInExpo(0.34693877551) ~ 0.010816576452', () => {
    expect(easeInExpo(0.34693877551)).toBeCloseTo(0.010816576452, 5);
  });
  it('easeInExpo(0.367346938776) ~ 0.012460185768', () => {
    expect(easeInExpo(0.367346938776)).toBeCloseTo(0.012460185768, 5);
  });
  it('easeInExpo(0.387755102041) ~ 0.014353546157', () => {
    expect(easeInExpo(0.387755102041)).toBeCloseTo(0.014353546157, 5);
  });
  it('easeInExpo(0.408163265306) ~ 0.016534608001', () => {
    expect(easeInExpo(0.408163265306)).toBeCloseTo(0.016534608001, 5);
  });
  it('easeInExpo(0.428571428571) ~ 0.019047088347', () => {
    expect(easeInExpo(0.428571428571)).toBeCloseTo(0.019047088347, 5);
  });
  it('easeInExpo(0.448979591837) ~ 0.021941347171', () => {
    expect(easeInExpo(0.448979591837)).toBeCloseTo(0.021941347171, 5);
  });
  it('easeInExpo(0.469387755102) ~ 0.025275396792', () => {
    expect(easeInExpo(0.469387755102)).toBeCloseTo(0.025275396792, 5);
  });
  it('easeInExpo(0.489795918367) ~ 0.029116064661', () => {
    expect(easeInExpo(0.489795918367)).toBeCloseTo(0.029116064661, 5);
  });
  it('easeInExpo(0.510204081633) ~ 0.03354033285', () => {
    expect(easeInExpo(0.510204081633)).toBeCloseTo(0.03354033285, 5);
  });
  it('easeInExpo(0.530612244898) ~ 0.038636881076', () => {
    expect(easeInExpo(0.530612244898)).toBeCloseTo(0.038636881076, 5);
  });
  it('easeInExpo(0.551020408163) ~ 0.044507864188', () => {
    expect(easeInExpo(0.551020408163)).toBeCloseTo(0.044507864188, 5);
  });
  it('easeInExpo(0.571428571429) ~ 0.05127095975', () => {
    expect(easeInExpo(0.571428571429)).toBeCloseTo(0.05127095975, 5);
  });
  it('easeInExpo(0.591836734694) ~ 0.059061726769', () => {
    expect(easeInExpo(0.591836734694)).toBeCloseTo(0.059061726769, 5);
  });
  it('easeInExpo(0.612244897959) ~ 0.068036322822', () => {
    expect(easeInExpo(0.612244897959)).toBeCloseTo(0.068036322822, 5);
  });
  it('easeInExpo(0.632653061224) ~ 0.078374634071', () => {
    expect(easeInExpo(0.632653061224)).toBeCloseTo(0.078374634071, 5);
  });
  it('easeInExpo(0.65306122449) ~ 0.090283880888', () => {
    expect(easeInExpo(0.65306122449)).toBeCloseTo(0.090283880888, 5);
  });
  it('easeInExpo(0.673469387755) ~ 0.104002771367', () => {
    expect(easeInExpo(0.673469387755)).toBeCloseTo(0.104002771367, 5);
  });
  it('easeInExpo(0.69387755102) ~ 0.119806285968', () => {
    expect(easeInExpo(0.69387755102)).toBeCloseTo(0.119806285968, 5);
  });
  it('easeInExpo(0.714285714286) ~ 0.138011189209', () => {
    expect(easeInExpo(0.714285714286)).toBeCloseTo(0.138011189209, 5);
  });
  it('easeInExpo(0.734693877551) ~ 0.158982378872', () => {
    expect(easeInExpo(0.734693877551)).toBeCloseTo(0.158982378872, 5);
  });
  it('easeInExpo(0.755102040816) ~ 0.183140199984', () => {
    expect(easeInExpo(0.755102040816)).toBeCloseTo(0.183140199984, 5);
  });
  it('easeInExpo(0.775510204082) ~ 0.210968870186', () => {
    expect(easeInExpo(0.775510204082)).toBeCloseTo(0.210968870186, 5);
  });
  it('easeInExpo(0.795918367347) ~ 0.243026185357', () => {
    expect(easeInExpo(0.795918367347)).toBeCloseTo(0.243026185357, 5);
  });
  it('easeInExpo(0.816326530612) ~ 0.279954700033', () => {
    expect(easeInExpo(0.816326530612)).toBeCloseTo(0.279954700033, 5);
  });
  it('easeInExpo(0.836734693878) ~ 0.322494606725', () => {
    expect(easeInExpo(0.836734693878)).toBeCloseTo(0.322494606725, 5);
  });
  it('easeInExpo(0.857142857143) ~ 0.371498572284', () => {
    expect(easeInExpo(0.857142857143)).toBeCloseTo(0.371498572284, 5);
  });
  it('easeInExpo(0.877551020408) ~ 0.427948828698', () => {
    expect(easeInExpo(0.877551020408)).toBeCloseTo(0.427948828698, 5);
  });
  it('easeInExpo(0.897959183673) ~ 0.492976860874', () => {
    expect(easeInExpo(0.897959183673)).toBeCloseTo(0.492976860874, 5);
  });
  it('easeInExpo(0.918367346939) ~ 0.567886086046', () => {
    expect(easeInExpo(0.918367346939)).toBeCloseTo(0.567886086046, 5);
  });
  it('easeInExpo(0.938775510204) ~ 0.654177979374', () => {
    expect(easeInExpo(0.938775510204)).toBeCloseTo(0.654177979374, 5);
  });
  it('easeInExpo(0.959183673469) ~ 0.753582169406', () => {
    expect(easeInExpo(0.959183673469)).toBeCloseTo(0.753582169406, 5);
  });
  it('easeInExpo(0.979591836735) ~ 0.868091106627', () => {
    expect(easeInExpo(0.979591836735)).toBeCloseTo(0.868091106627, 5);
  });
});

describe('easeOutExpo', () => {
  it('easeOutExpo(0) ~ 0', () => { expect(easeOutExpo(0)).toBeCloseTo(0, 5); });
  it('easeOutExpo(1) === 1', () => { expect(easeOutExpo(1)).toBe(1); });
  it('easeOutExpo(0.020408163265) ~ 0.131908893373', () => {
    expect(easeOutExpo(0.020408163265)).toBeCloseTo(0.131908893373, 5);
  });
  it('easeOutExpo(0.040816326531) ~ 0.246417830594', () => {
    expect(easeOutExpo(0.040816326531)).toBeCloseTo(0.246417830594, 5);
  });
  it('easeOutExpo(0.061224489796) ~ 0.345822020626', () => {
    expect(easeOutExpo(0.061224489796)).toBeCloseTo(0.345822020626, 5);
  });
  it('easeOutExpo(0.081632653061) ~ 0.432113913954', () => {
    expect(easeOutExpo(0.081632653061)).toBeCloseTo(0.432113913954, 5);
  });
  it('easeOutExpo(0.102040816327) ~ 0.507023139126', () => {
    expect(easeOutExpo(0.102040816327)).toBeCloseTo(0.507023139126, 5);
  });
  it('easeOutExpo(0.122448979592) ~ 0.572051171302', () => {
    expect(easeOutExpo(0.122448979592)).toBeCloseTo(0.572051171302, 5);
  });
  it('easeOutExpo(0.142857142857) ~ 0.628501427716', () => {
    expect(easeOutExpo(0.142857142857)).toBeCloseTo(0.628501427716, 5);
  });
  it('easeOutExpo(0.163265306122) ~ 0.677505393275', () => {
    expect(easeOutExpo(0.163265306122)).toBeCloseTo(0.677505393275, 5);
  });
  it('easeOutExpo(0.183673469388) ~ 0.720045299967', () => {
    expect(easeOutExpo(0.183673469388)).toBeCloseTo(0.720045299967, 5);
  });
  it('easeOutExpo(0.204081632653) ~ 0.756973814643', () => {
    expect(easeOutExpo(0.204081632653)).toBeCloseTo(0.756973814643, 5);
  });
  it('easeOutExpo(0.224489795918) ~ 0.789031129814', () => {
    expect(easeOutExpo(0.224489795918)).toBeCloseTo(0.789031129814, 5);
  });
  it('easeOutExpo(0.244897959184) ~ 0.816859800016', () => {
    expect(easeOutExpo(0.244897959184)).toBeCloseTo(0.816859800016, 5);
  });
  it('easeOutExpo(0.265306122449) ~ 0.841017621128', () => {
    expect(easeOutExpo(0.265306122449)).toBeCloseTo(0.841017621128, 5);
  });
  it('easeOutExpo(0.285714285714) ~ 0.861988810791', () => {
    expect(easeOutExpo(0.285714285714)).toBeCloseTo(0.861988810791, 5);
  });
  it('easeOutExpo(0.30612244898) ~ 0.880193714032', () => {
    expect(easeOutExpo(0.30612244898)).toBeCloseTo(0.880193714032, 5);
  });
  it('easeOutExpo(0.326530612245) ~ 0.895997228633', () => {
    expect(easeOutExpo(0.326530612245)).toBeCloseTo(0.895997228633, 5);
  });
  it('easeOutExpo(0.34693877551) ~ 0.909716119112', () => {
    expect(easeOutExpo(0.34693877551)).toBeCloseTo(0.909716119112, 5);
  });
  it('easeOutExpo(0.367346938776) ~ 0.921625365929', () => {
    expect(easeOutExpo(0.367346938776)).toBeCloseTo(0.921625365929, 5);
  });
  it('easeOutExpo(0.387755102041) ~ 0.931963677178', () => {
    expect(easeOutExpo(0.387755102041)).toBeCloseTo(0.931963677178, 5);
  });
  it('easeOutExpo(0.408163265306) ~ 0.940938273231', () => {
    expect(easeOutExpo(0.408163265306)).toBeCloseTo(0.940938273231, 5);
  });
  it('easeOutExpo(0.428571428571) ~ 0.94872904025', () => {
    expect(easeOutExpo(0.428571428571)).toBeCloseTo(0.94872904025, 5);
  });
  it('easeOutExpo(0.448979591837) ~ 0.955492135812', () => {
    expect(easeOutExpo(0.448979591837)).toBeCloseTo(0.955492135812, 5);
  });
  it('easeOutExpo(0.469387755102) ~ 0.961363118924', () => {
    expect(easeOutExpo(0.469387755102)).toBeCloseTo(0.961363118924, 5);
  });
  it('easeOutExpo(0.489795918367) ~ 0.96645966715', () => {
    expect(easeOutExpo(0.489795918367)).toBeCloseTo(0.96645966715, 5);
  });
  it('easeOutExpo(0.510204081633) ~ 0.970883935339', () => {
    expect(easeOutExpo(0.510204081633)).toBeCloseTo(0.970883935339, 5);
  });
  it('easeOutExpo(0.530612244898) ~ 0.974724603208', () => {
    expect(easeOutExpo(0.530612244898)).toBeCloseTo(0.974724603208, 5);
  });
  it('easeOutExpo(0.551020408163) ~ 0.978058652829', () => {
    expect(easeOutExpo(0.551020408163)).toBeCloseTo(0.978058652829, 5);
  });
  it('easeOutExpo(0.571428571429) ~ 0.980952911653', () => {
    expect(easeOutExpo(0.571428571429)).toBeCloseTo(0.980952911653, 5);
  });
  it('easeOutExpo(0.591836734694) ~ 0.983465391999', () => {
    expect(easeOutExpo(0.591836734694)).toBeCloseTo(0.983465391999, 5);
  });
  it('easeOutExpo(0.612244897959) ~ 0.985646453843', () => {
    expect(easeOutExpo(0.612244897959)).toBeCloseTo(0.985646453843, 5);
  });
  it('easeOutExpo(0.632653061224) ~ 0.987539814232', () => {
    expect(easeOutExpo(0.632653061224)).toBeCloseTo(0.987539814232, 5);
  });
  it('easeOutExpo(0.65306122449) ~ 0.989183423548', () => {
    expect(easeOutExpo(0.65306122449)).toBeCloseTo(0.989183423548, 5);
  });
  it('easeOutExpo(0.673469387755) ~ 0.990610226178', () => {
    expect(easeOutExpo(0.673469387755)).toBeCloseTo(0.990610226178, 5);
  });
  it('easeOutExpo(0.69387755102) ~ 0.991848820852', () => {
    expect(easeOutExpo(0.69387755102)).toBeCloseTo(0.991848820852, 5);
  });
  it('easeOutExpo(0.714285714286) ~ 0.992924033873', () => {
    expect(easeOutExpo(0.714285714286)).toBeCloseTo(0.992924033873, 5);
  });
  it('easeOutExpo(0.734693877551) ~ 0.993857416734', () => {
    expect(easeOutExpo(0.734693877551)).toBeCloseTo(0.993857416734, 5);
  });
  it('easeOutExpo(0.755102040816) ~ 0.994667678095', () => {
    expect(easeOutExpo(0.755102040816)).toBeCloseTo(0.994667678095, 5);
  });
  it('easeOutExpo(0.775510204082) ~ 0.995371058777', () => {
    expect(easeOutExpo(0.775510204082)).toBeCloseTo(0.995371058777, 5);
  });
  it('easeOutExpo(0.795918367347) ~ 0.995981657291', () => {
    expect(easeOutExpo(0.795918367347)).toBeCloseTo(0.995981657291, 5);
  });
  it('easeOutExpo(0.816326530612) ~ 0.996511712431', () => {
    expect(easeOutExpo(0.816326530612)).toBeCloseTo(0.996511712431, 5);
  });
  it('easeOutExpo(0.836734693878) ~ 0.996971848584', () => {
    expect(easeOutExpo(0.836734693878)).toBeCloseTo(0.996971848584, 5);
  });
  it('easeOutExpo(0.857142857143) ~ 0.997371288686', () => {
    expect(easeOutExpo(0.857142857143)).toBeCloseTo(0.997371288686, 5);
  });
  it('easeOutExpo(0.877551020408) ~ 0.997718039087', () => {
    expect(easeOutExpo(0.877551020408)).toBeCloseTo(0.997718039087, 5);
  });
  it('easeOutExpo(0.897959183673) ~ 0.998019050025', () => {
    expect(easeOutExpo(0.897959183673)).toBeCloseTo(0.998019050025, 5);
  });
  it('easeOutExpo(0.918367346939) ~ 0.998280354944', () => {
    expect(easeOutExpo(0.918367346939)).toBeCloseTo(0.998280354944, 5);
  });
  it('easeOutExpo(0.938775510204) ~ 0.998507191421', () => {
    expect(easeOutExpo(0.938775510204)).toBeCloseTo(0.998507191421, 5);
  });
  it('easeOutExpo(0.959183673469) ~ 0.998704106148', () => {
    expect(easeOutExpo(0.959183673469)).toBeCloseTo(0.998704106148, 5);
  });
});

describe('easeInBack', () => {
  it('easeInBack(0) === 0', () => { expect(easeInBack(0)).toBeCloseTo(0, 5); });
  it('easeInBack(1) === 1', () => { expect(easeInBack(1)).toBeCloseTo(1, 5); });
  it('easeInBack(0.041666666667) ~ -0.00275870515', () => {
    expect(easeInBack(0.041666666667)).toBeCloseTo(-0.00275870515, 5);
  });
  it('easeInBack(0.083333333333) ~ -0.010253113426', () => {
    expect(easeInBack(0.083333333333)).toBeCloseTo(-0.010253113426, 5);
  });
  it('easeInBack(0.125) ~ -0.021310664063', () => {
    expect(easeInBack(0.125)).toBeCloseTo(-0.021310664063, 5);
  });
  it('easeInBack(0.166666666667) ~ -0.034758796296', () => {
    expect(easeInBack(0.166666666667)).toBeCloseTo(-0.034758796296, 5);
  });
  it('easeInBack(0.208333333333) ~ -0.049424949363', () => {
    expect(easeInBack(0.208333333333)).toBeCloseTo(-0.049424949363, 5);
  });
  it('easeInBack(0.25) ~ -0.0641365625', () => {
    expect(easeInBack(0.25)).toBeCloseTo(-0.0641365625, 5);
  });
  it('easeInBack(0.291666666667) ~ -0.077721074942', () => {
    expect(easeInBack(0.291666666667)).toBeCloseTo(-0.077721074942, 5);
  });
  it('easeInBack(0.333333333333) ~ -0.089005925926', () => {
    expect(easeInBack(0.333333333333)).toBeCloseTo(-0.089005925926, 5);
  });
  it('easeInBack(0.375) ~ -0.096818554688', () => {
    expect(easeInBack(0.375)).toBeCloseTo(-0.096818554688, 5);
  });
  it('easeInBack(0.416666666667) ~ -0.099986400463', () => {
    expect(easeInBack(0.416666666667)).toBeCloseTo(-0.099986400463, 5);
  });
  it('easeInBack(0.458333333333) ~ -0.097336902488', () => {
    expect(easeInBack(0.458333333333)).toBeCloseTo(-0.097336902488, 5);
  });
  it('easeInBack(0.5) ~ -0.0876975', () => {
    expect(easeInBack(0.5)).toBeCloseTo(-0.0876975, 5);
  });
  it('easeInBack(0.541666666667) ~ -0.069895632234', () => {
    expect(easeInBack(0.541666666667)).toBeCloseTo(-0.069895632234, 5);
  });
  it('easeInBack(0.583333333333) ~ -0.042758738426', () => {
    expect(easeInBack(0.583333333333)).toBeCloseTo(-0.042758738426, 5);
  });
  it('easeInBack(0.625) ~ -0.005114257813', () => {
    expect(easeInBack(0.625)).toBeCloseTo(-0.005114257813, 5);
  });
  it('easeInBack(0.666666666667) ~ 0.04421037037', () => {
    expect(easeInBack(0.666666666667)).toBeCloseTo(0.04421037037, 5);
  });
  it('easeInBack(0.708333333333) ~ 0.106387706887', () => {
    expect(easeInBack(0.708333333333)).toBeCloseTo(0.106387706887, 5);
  });
  it('easeInBack(0.75) ~ 0.1825903125', () => {
    expect(easeInBack(0.75)).toBeCloseTo(0.1825903125, 5);
  });
  it('easeInBack(0.791666666667) ~ 0.273990747975', () => {
    expect(easeInBack(0.791666666667)).toBeCloseTo(0.273990747975, 5);
  });
  it('easeInBack(0.833333333333) ~ 0.381761574074', () => {
    expect(easeInBack(0.833333333333)).toBeCloseTo(0.381761574074, 5);
  });
  it('easeInBack(0.875) ~ 0.507075351562', () => {
    expect(easeInBack(0.875)).toBeCloseTo(0.507075351562, 5);
  });
  it('easeInBack(0.916666666667) ~ 0.651104641204', () => {
    expect(easeInBack(0.916666666667)).toBeCloseTo(0.651104641204, 5);
  });
});

describe('easeOutBack', () => {
  it('easeOutBack(0) === 0', () => { expect(easeOutBack(0)).toBeCloseTo(0, 5); });
  it('easeOutBack(1) === 1', () => { expect(easeOutBack(1)).toBeCloseTo(1, 5); });
  it('easeOutBack(0.041666666667) ~ 0.184977996238', () => {
    expect(easeOutBack(0.041666666667)).toBeCloseTo(0.184977996238, 5);
  });
  it('easeOutBack(0.083333333333) ~ 0.348895358796', () => {
    expect(easeOutBack(0.083333333333)).toBeCloseTo(0.348895358796, 5);
  });
  it('easeOutBack(0.125) ~ 0.492924648438', () => {
    expect(easeOutBack(0.125)).toBeCloseTo(0.492924648438, 5);
  });
  it('easeOutBack(0.166666666667) ~ 0.618238425926', () => {
    expect(easeOutBack(0.166666666667)).toBeCloseTo(0.618238425926, 5);
  });
  it('easeOutBack(0.208333333333) ~ 0.726009252025', () => {
    expect(easeOutBack(0.208333333333)).toBeCloseTo(0.726009252025, 5);
  });
  it('easeOutBack(0.25) ~ 0.8174096875', () => {
    expect(easeOutBack(0.25)).toBeCloseTo(0.8174096875, 5);
  });
  it('easeOutBack(0.291666666667) ~ 0.893612293113', () => {
    expect(easeOutBack(0.291666666667)).toBeCloseTo(0.893612293113, 5);
  });
  it('easeOutBack(0.333333333333) ~ 0.95578962963', () => {
    expect(easeOutBack(0.333333333333)).toBeCloseTo(0.95578962963, 5);
  });
  it('easeOutBack(0.375) ~ 1.005114257813', () => {
    expect(easeOutBack(0.375)).toBeCloseTo(1.005114257813, 5);
  });
  it('easeOutBack(0.416666666667) ~ 1.042758738426', () => {
    expect(easeOutBack(0.416666666667)).toBeCloseTo(1.042758738426, 5);
  });
  it('easeOutBack(0.458333333333) ~ 1.069895632234', () => {
    expect(easeOutBack(0.458333333333)).toBeCloseTo(1.069895632234, 5);
  });
  it('easeOutBack(0.5) ~ 1.0876975', () => {
    expect(easeOutBack(0.5)).toBeCloseTo(1.0876975, 5);
  });
  it('easeOutBack(0.541666666667) ~ 1.097336902488', () => {
    expect(easeOutBack(0.541666666667)).toBeCloseTo(1.097336902488, 5);
  });
  it('easeOutBack(0.583333333333) ~ 1.099986400463', () => {
    expect(easeOutBack(0.583333333333)).toBeCloseTo(1.099986400463, 5);
  });
  it('easeOutBack(0.625) ~ 1.096818554688', () => {
    expect(easeOutBack(0.625)).toBeCloseTo(1.096818554688, 5);
  });
  it('easeOutBack(0.666666666667) ~ 1.089005925926', () => {
    expect(easeOutBack(0.666666666667)).toBeCloseTo(1.089005925926, 5);
  });
  it('easeOutBack(0.708333333333) ~ 1.077721074942', () => {
    expect(easeOutBack(0.708333333333)).toBeCloseTo(1.077721074942, 5);
  });
  it('easeOutBack(0.75) ~ 1.0641365625', () => {
    expect(easeOutBack(0.75)).toBeCloseTo(1.0641365625, 5);
  });
  it('easeOutBack(0.791666666667) ~ 1.049424949363', () => {
    expect(easeOutBack(0.791666666667)).toBeCloseTo(1.049424949363, 5);
  });
  it('easeOutBack(0.833333333333) ~ 1.034758796296', () => {
    expect(easeOutBack(0.833333333333)).toBeCloseTo(1.034758796296, 5);
  });
  it('easeOutBack(0.875) ~ 1.021310664063', () => {
    expect(easeOutBack(0.875)).toBeCloseTo(1.021310664063, 5);
  });
  it('easeOutBack(0.916666666667) ~ 1.010253113426', () => {
    expect(easeOutBack(0.916666666667)).toBeCloseTo(1.010253113426, 5);
  });
});

describe('easeOutBounce', () => {
  it('easeOutBounce(0) === 0', () => { expect(easeOutBounce(0)).toBeCloseTo(0, 5); });
  it('easeOutBounce(1) === 1', () => { expect(easeOutBounce(1)).toBeCloseTo(1, 5); });
  it('easeOutBounce(0.041666666667) ~ 0.013129340278', () => {
    expect(easeOutBounce(0.041666666667)).toBeCloseTo(0.013129340278, 5);
  });
  it('easeOutBounce(0.083333333333) ~ 0.052517361111', () => {
    expect(easeOutBounce(0.083333333333)).toBeCloseTo(0.052517361111, 5);
  });
  it('easeOutBounce(0.125) ~ 0.1181640625', () => {
    expect(easeOutBounce(0.125)).toBeCloseTo(0.1181640625, 5);
  });
  it('easeOutBounce(0.166666666667) ~ 0.210069444444', () => {
    expect(easeOutBounce(0.166666666667)).toBeCloseTo(0.210069444444, 5);
  });
  it('easeOutBounce(0.208333333333) ~ 0.328233506944', () => {
    expect(easeOutBounce(0.208333333333)).toBeCloseTo(0.328233506944, 5);
  });
  it('easeOutBounce(0.25) ~ 0.47265625', () => {
    expect(easeOutBounce(0.25)).toBeCloseTo(0.47265625, 5);
  });
  it('easeOutBounce(0.291666666667) ~ 0.643337673611', () => {
    expect(easeOutBounce(0.291666666667)).toBeCloseTo(0.643337673611, 5);
  });
  it('easeOutBounce(0.333333333333) ~ 0.840277777778', () => {
    expect(easeOutBounce(0.333333333333)).toBeCloseTo(0.840277777778, 5);
  });
  it('easeOutBounce(0.375) ~ 0.9697265625', () => {
    expect(easeOutBounce(0.375)).toBeCloseTo(0.9697265625, 5);
  });
  it('easeOutBounce(0.416666666667) ~ 0.875434027778', () => {
    expect(easeOutBounce(0.416666666667)).toBeCloseTo(0.875434027778, 5);
  });
  it('easeOutBounce(0.458333333333) ~ 0.807400173611', () => {
    expect(easeOutBounce(0.458333333333)).toBeCloseTo(0.807400173611, 5);
  });
  it('easeOutBounce(0.5) ~ 0.765625', () => {
    expect(easeOutBounce(0.5)).toBeCloseTo(0.765625, 5);
  });
  it('easeOutBounce(0.541666666667) ~ 0.750108506944', () => {
    expect(easeOutBounce(0.541666666667)).toBeCloseTo(0.750108506944, 5);
  });
  it('easeOutBounce(0.583333333333) ~ 0.760850694444', () => {
    expect(easeOutBounce(0.583333333333)).toBeCloseTo(0.760850694444, 5);
  });
  it('easeOutBounce(0.625) ~ 0.7978515625', () => {
    expect(easeOutBounce(0.625)).toBeCloseTo(0.7978515625, 5);
  });
  it('easeOutBounce(0.666666666667) ~ 0.861111111111', () => {
    expect(easeOutBounce(0.666666666667)).toBeCloseTo(0.861111111111, 5);
  });
  it('easeOutBounce(0.708333333333) ~ 0.950629340278', () => {
    expect(easeOutBounce(0.708333333333)).toBeCloseTo(0.950629340278, 5);
  });
  it('easeOutBounce(0.75) ~ 0.97265625', () => {
    expect(easeOutBounce(0.75)).toBeCloseTo(0.97265625, 5);
  });
  it('easeOutBounce(0.791666666667) ~ 0.942816840278', () => {
    expect(easeOutBounce(0.791666666667)).toBeCloseTo(0.942816840278, 5);
  });
  it('easeOutBounce(0.833333333333) ~ 0.939236111111', () => {
    expect(easeOutBounce(0.833333333333)).toBeCloseTo(0.939236111111, 5);
  });
  it('easeOutBounce(0.875) ~ 0.9619140625', () => {
    expect(easeOutBounce(0.875)).toBeCloseTo(0.9619140625, 5);
  });
  it('easeOutBounce(0.916666666667) ~ 0.995225694444', () => {
    expect(easeOutBounce(0.916666666667)).toBeCloseTo(0.995225694444, 5);
  });
});

describe('easeInBounce', () => {
  it('easeInBounce(0) === 0', () => { expect(easeInBounce(0)).toBeCloseTo(0, 5); });
  it('easeInBounce(1) === 1', () => { expect(easeInBounce(1)).toBeCloseTo(1, 5); });
  it('easeInBounce(0.041666666667) ~ 0.015516493056', () => {
    expect(easeInBounce(0.041666666667)).toBeCloseTo(0.015516493056, 5);
  });
  it('easeInBounce(0.083333333333) ~ 0.004774305556', () => {
    expect(easeInBounce(0.083333333333)).toBeCloseTo(0.004774305556, 5);
  });
  it('easeInBounce(0.125) ~ 0.0380859375', () => {
    expect(easeInBounce(0.125)).toBeCloseTo(0.0380859375, 5);
  });
  it('easeInBounce(0.166666666667) ~ 0.060763888889', () => {
    expect(easeInBounce(0.166666666667)).toBeCloseTo(0.060763888889, 5);
  });
  it('easeInBounce(0.208333333333) ~ 0.057183159722', () => {
    expect(easeInBounce(0.208333333333)).toBeCloseTo(0.057183159722, 5);
  });
  it('easeInBounce(0.25) ~ 0.02734375', () => {
    expect(easeInBounce(0.25)).toBeCloseTo(0.02734375, 5);
  });
  it('easeInBounce(0.291666666667) ~ 0.049370659722', () => {
    expect(easeInBounce(0.291666666667)).toBeCloseTo(0.049370659722, 5);
  });
  it('easeInBounce(0.333333333333) ~ 0.138888888889', () => {
    expect(easeInBounce(0.333333333333)).toBeCloseTo(0.138888888889, 5);
  });
  it('easeInBounce(0.375) ~ 0.2021484375', () => {
    expect(easeInBounce(0.375)).toBeCloseTo(0.2021484375, 5);
  });
  it('easeInBounce(0.416666666667) ~ 0.239149305556', () => {
    expect(easeInBounce(0.416666666667)).toBeCloseTo(0.239149305556, 5);
  });
  it('easeInBounce(0.458333333333) ~ 0.249891493056', () => {
    expect(easeInBounce(0.458333333333)).toBeCloseTo(0.249891493056, 5);
  });
  it('easeInBounce(0.5) ~ 0.234375', () => {
    expect(easeInBounce(0.5)).toBeCloseTo(0.234375, 5);
  });
  it('easeInBounce(0.541666666667) ~ 0.192599826389', () => {
    expect(easeInBounce(0.541666666667)).toBeCloseTo(0.192599826389, 5);
  });
  it('easeInBounce(0.583333333333) ~ 0.124565972222', () => {
    expect(easeInBounce(0.583333333333)).toBeCloseTo(0.124565972222, 5);
  });
  it('easeInBounce(0.625) ~ 0.0302734375', () => {
    expect(easeInBounce(0.625)).toBeCloseTo(0.0302734375, 5);
  });
  it('easeInBounce(0.666666666667) ~ 0.159722222222', () => {
    expect(easeInBounce(0.666666666667)).toBeCloseTo(0.159722222222, 5);
  });
  it('easeInBounce(0.708333333333) ~ 0.356662326389', () => {
    expect(easeInBounce(0.708333333333)).toBeCloseTo(0.356662326389, 5);
  });
  it('easeInBounce(0.75) ~ 0.52734375', () => {
    expect(easeInBounce(0.75)).toBeCloseTo(0.52734375, 5);
  });
  it('easeInBounce(0.791666666667) ~ 0.671766493056', () => {
    expect(easeInBounce(0.791666666667)).toBeCloseTo(0.671766493056, 5);
  });
  it('easeInBounce(0.833333333333) ~ 0.789930555556', () => {
    expect(easeInBounce(0.833333333333)).toBeCloseTo(0.789930555556, 5);
  });
  it('easeInBounce(0.875) ~ 0.8818359375', () => {
    expect(easeInBounce(0.875)).toBeCloseTo(0.8818359375, 5);
  });
  it('easeInBounce(0.916666666667) ~ 0.947482638889', () => {
    expect(easeInBounce(0.916666666667)).toBeCloseTo(0.947482638889, 5);
  });
});

describe('easeInElastic', () => {
  it('easeInElastic(0) === 0', () => { expect(easeInElastic(0)).toBe(0); });
  it('easeInElastic(1) === 1', () => { expect(easeInElastic(1)).toBe(1); });
  it('easeInElastic(0.041666666667) ~ 0.000445841912', () => {
    expect(easeInElastic(0.041666666667)).toBeCloseTo(0.000445841912, 5);
  });
  it('easeInElastic(0.083333333333) ~ 0.001635099514', () => {
    expect(easeInElastic(0.083333333333)).toBeCloseTo(0.001635099514, 5);
  });
  it('easeInElastic(0.125) ~ 0.002011491351', () => {
    expect(easeInElastic(0.125)).toBeCloseTo(0.002011491351, 5);
  });
  it('easeInElastic(0.166666666667) ~ 0.000538377539', () => {
    expect(easeInElastic(0.166666666667)).toBeCloseTo(0.000538377539, 5);
  });
  it('easeInElastic(0.208333333333) ~ -0.002660194336', () => {
    expect(easeInElastic(0.208333333333)).toBeCloseTo(-0.002660194336, 5);
  });
  it('easeInElastic(0.25) ~ -0.005524271728', () => {
    expect(easeInElastic(0.25)).toBeCloseTo(-0.005524271728, 5);
  });
  it('easeInElastic(0.291666666667) ~ -0.004739927448', () => {
    expect(easeInElastic(0.291666666667)).toBeCloseTo(-0.004739927448, 5);
  });
  it('easeInElastic(0.333333333333) ~ 0.001709242143', () => {
    expect(easeInElastic(0.333333333333)).toBeCloseTo(0.001709242143, 5);
  });
  it('easeInElastic(0.375) ~ 0.011378713399', () => {
    expect(easeInElastic(0.375)).toBeCloseTo(0.011378713399, 5);
  });
  it('easeInElastic(0.416666666667) ~ 0.016480770374', () => {
    expect(easeInElastic(0.416666666667)).toBeCloseTo(0.016480770374, 5);
  });
  it('easeInElastic(0.458333333333) ~ 0.008007050018', () => {
    expect(easeInElastic(0.458333333333)).toBeCloseTo(0.008007050018, 5);
  });
  it('easeInElastic(0.5) ~ -0.015625', () => {
    expect(easeInElastic(0.5)).toBeCloseTo(-0.015625, 5);
  });
  it('easeInElastic(0.541666666667) ~ -0.041080019919', () => {
    expect(easeInElastic(0.541666666667)).toBeCloseTo(-0.041080019919, 5);
  });
  it('easeInElastic(0.583333333333) ~ -0.042654250776', () => {
    expect(easeInElastic(0.583333333333)).toBeCloseTo(-0.042654250776, 5);
  });
  it('easeInElastic(0.625) ~ 0.0', () => {
    expect(easeInElastic(0.625)).toBeCloseTo(0.0, 5);
  });
  it('easeInElastic(0.666666666667) ~ 0.076001234679', () => {
    expect(easeInElastic(0.666666666667)).toBeCloseTo(0.076001234679, 5);
  });
  it('easeInElastic(0.708333333333) ~ 0.130420933669', () => {
    expect(easeInElastic(0.708333333333)).toBeCloseTo(0.130420933669, 5);
  });
  it('easeInElastic(0.75) ~ 0.088388347648', () => {
    expect(easeInElastic(0.75)).toBeCloseTo(0.088388347648, 5);
  });
  it('easeInElastic(0.791666666667) ~ -0.080706006926', () => {
    expect(easeInElastic(0.791666666667)).toBeCloseTo(-0.080706006926, 5);
  });
  it('easeInElastic(0.833333333333) ~ -0.29598462834', () => {
    expect(easeInElastic(0.833333333333)).toBeCloseTo(-0.29598462834, 5);
  });
  it('easeInElastic(0.875) ~ -0.36411882878', () => {
    expect(easeInElastic(0.875)).toBeCloseTo(-0.36411882878, 5);
  });
  it('easeInElastic(0.916666666667) ~ -0.097456744595', () => {
    expect(easeInElastic(0.916666666667)).toBeCloseTo(-0.097456744595, 5);
  });
});

describe('easeOutElastic', () => {
  it('easeOutElastic(0) === 0', () => { expect(easeOutElastic(0)).toBe(0); });
  it('easeOutElastic(1) === 1', () => { expect(easeOutElastic(1)).toBe(1); });
  it('easeOutElastic(0.041666666667) ~ 0.518453387739', () => {
    expect(easeOutElastic(0.041666666667)).toBeCloseTo(0.518453387739, 5);
  });
  it('easeOutElastic(0.083333333333) ~ 1.097456744595', () => {
    expect(easeOutElastic(0.083333333333)).toBeCloseTo(1.097456744595, 5);
  });
  it('easeOutElastic(0.125) ~ 1.36411882878', () => {
    expect(easeOutElastic(0.125)).toBeCloseTo(1.36411882878, 5);
  });
  it('easeOutElastic(0.166666666667) ~ 1.29598462834', () => {
    expect(easeOutElastic(0.166666666667)).toBeCloseTo(1.29598462834, 5);
  });
  it('easeOutElastic(0.208333333333) ~ 1.080706006926', () => {
    expect(easeOutElastic(0.208333333333)).toBeCloseTo(1.080706006926, 5);
  });
  it('easeOutElastic(0.25) ~ 0.911611652352', () => {
    expect(easeOutElastic(0.25)).toBeCloseTo(0.911611652352, 5);
  });
  it('easeOutElastic(0.291666666667) ~ 0.869579066331', () => {
    expect(easeOutElastic(0.291666666667)).toBeCloseTo(0.869579066331, 5);
  });
  it('easeOutElastic(0.333333333333) ~ 0.923998765321', () => {
    expect(easeOutElastic(0.333333333333)).toBeCloseTo(0.923998765321, 5);
  });
  it('easeOutElastic(0.375) ~ 1', () => {
    expect(easeOutElastic(0.375)).toBeCloseTo(1, 5);
  });
  it('easeOutElastic(0.416666666667) ~ 1.042654250776', () => {
    expect(easeOutElastic(0.416666666667)).toBeCloseTo(1.042654250776, 5);
  });
  it('easeOutElastic(0.458333333333) ~ 1.041080019919', () => {
    expect(easeOutElastic(0.458333333333)).toBeCloseTo(1.041080019919, 5);
  });
  it('easeOutElastic(0.5) ~ 1.015625', () => {
    expect(easeOutElastic(0.5)).toBeCloseTo(1.015625, 5);
  });
  it('easeOutElastic(0.541666666667) ~ 0.991992949982', () => {
    expect(easeOutElastic(0.541666666667)).toBeCloseTo(0.991992949982, 5);
  });
  it('easeOutElastic(0.583333333333) ~ 0.983519229626', () => {
    expect(easeOutElastic(0.583333333333)).toBeCloseTo(0.983519229626, 5);
  });
  it('easeOutElastic(0.625) ~ 0.988621286601', () => {
    expect(easeOutElastic(0.625)).toBeCloseTo(0.988621286601, 5);
  });
  it('easeOutElastic(0.666666666667) ~ 0.998290757857', () => {
    expect(easeOutElastic(0.666666666667)).toBeCloseTo(0.998290757857, 5);
  });
  it('easeOutElastic(0.708333333333) ~ 1.004739927448', () => {
    expect(easeOutElastic(0.708333333333)).toBeCloseTo(1.004739927448, 5);
  });
  it('easeOutElastic(0.75) ~ 1.005524271728', () => {
    expect(easeOutElastic(0.75)).toBeCloseTo(1.005524271728, 5);
  });
  it('easeOutElastic(0.791666666667) ~ 1.002660194336', () => {
    expect(easeOutElastic(0.791666666667)).toBeCloseTo(1.002660194336, 5);
  });
  it('easeOutElastic(0.833333333333) ~ 0.999461622461', () => {
    expect(easeOutElastic(0.833333333333)).toBeCloseTo(0.999461622461, 5);
  });
  it('easeOutElastic(0.875) ~ 0.997988508649', () => {
    expect(easeOutElastic(0.875)).toBeCloseTo(0.997988508649, 5);
  });
  it('easeOutElastic(0.916666666667) ~ 0.998364900486', () => {
    expect(easeOutElastic(0.916666666667)).toBeCloseTo(0.998364900486, 5);
  });
});

describe('lerp', () => {
  it('lerp(0,100,0) === 0', () => {
    expect(lerp(0,100,0)).toBeCloseTo(0, 5);
  });
  it('lerp(0,100,1) === 100', () => {
    expect(lerp(0,100,1)).toBeCloseTo(100, 5);
  });
  it('lerp(0,100,0.5) === 50.0', () => {
    expect(lerp(0,100,0.5)).toBeCloseTo(50.0, 5);
  });
  it('lerp(0,1,0) === 0', () => {
    expect(lerp(0,1,0)).toBeCloseTo(0, 5);
  });
  it('lerp(0,1,1) === 1', () => {
    expect(lerp(0,1,1)).toBeCloseTo(1, 5);
  });
  it('lerp(0,1,0.5) === 0.5', () => {
    expect(lerp(0,1,0.5)).toBeCloseTo(0.5, 5);
  });
  it('lerp(-50,50,0) === -50', () => {
    expect(lerp(-50,50,0)).toBeCloseTo(-50, 5);
  });
  it('lerp(-50,50,1) === 50', () => {
    expect(lerp(-50,50,1)).toBeCloseTo(50, 5);
  });
  it('lerp(-50,50,0.5) === 0', () => {
    expect(lerp(-50,50,0.5)).toBeCloseTo(0, 5);
  });
  it('lerp(10,20,0) === 10', () => {
    expect(lerp(10,20,0)).toBeCloseTo(10, 5);
  });
  it('lerp(10,20,1) === 20', () => {
    expect(lerp(10,20,1)).toBeCloseTo(20, 5);
  });
  it('lerp(10,20,0.5) === 15.0', () => {
    expect(lerp(10,20,0.5)).toBeCloseTo(15.0, 5);
  });
  it('lerp(100,200,0) === 100', () => {
    expect(lerp(100,200,0)).toBeCloseTo(100, 5);
  });
  it('lerp(100,200,1) === 200', () => {
    expect(lerp(100,200,1)).toBeCloseTo(200, 5);
  });
  it('lerp(100,200,0.5) === 150.0', () => {
    expect(lerp(100,200,0.5)).toBeCloseTo(150.0, 5);
  });
  it('lerp(-100,0,0) === -100', () => {
    expect(lerp(-100,0,0)).toBeCloseTo(-100, 5);
  });
  it('lerp(-100,0,1) === 0', () => {
    expect(lerp(-100,0,1)).toBeCloseTo(0, 5);
  });
  it('lerp(-100,0,0.5) === -50.0', () => {
    expect(lerp(-100,0,0.5)).toBeCloseTo(-50.0, 5);
  });
  it('lerp(5,15,0) === 5', () => {
    expect(lerp(5,15,0)).toBeCloseTo(5, 5);
  });
  it('lerp(5,15,1) === 15', () => {
    expect(lerp(5,15,1)).toBeCloseTo(15, 5);
  });
  it('lerp(5,15,0.5) === 10.0', () => {
    expect(lerp(5,15,0.5)).toBeCloseTo(10.0, 5);
  });
  it('lerp(1000,2000,0) === 1000', () => {
    expect(lerp(1000,2000,0)).toBeCloseTo(1000, 5);
  });
  it('lerp(1000,2000,1) === 2000', () => {
    expect(lerp(1000,2000,1)).toBeCloseTo(2000, 5);
  });
  it('lerp(1000,2000,0.5) === 1500.0', () => {
    expect(lerp(1000,2000,0.5)).toBeCloseTo(1500.0, 5);
  });
  it('lerp(-1,1,0) === -1', () => {
    expect(lerp(-1,1,0)).toBeCloseTo(-1, 5);
  });
  it('lerp(-1,1,1) === 1', () => {
    expect(lerp(-1,1,1)).toBeCloseTo(1, 5);
  });
  it('lerp(-1,1,0.5) === 0', () => {
    expect(lerp(-1,1,0.5)).toBeCloseTo(0, 5);
  });
  it('lerp(0.5,1.5,0) === 0.5', () => {
    expect(lerp(0.5,1.5,0)).toBeCloseTo(0.5, 5);
  });
  it('lerp(0.5,1.5,1) === 1.5', () => {
    expect(lerp(0.5,1.5,1)).toBeCloseTo(1.5, 5);
  });
  it('lerp(0.5,1.5,0.5) === 1', () => {
    expect(lerp(0.5,1.5,0.5)).toBeCloseTo(1, 5);
  });
  it('lerp(0,100,0.1) ~ 10.0', () => {
    expect(lerp(0,100,0.1)).toBeCloseTo(10.0, 5);
  });
  it('lerp(10,110,0.2) ~ 30.0', () => {
    expect(lerp(10,110,0.2)).toBeCloseTo(30.0, 5);
  });
  it('lerp(20,120,0.3) ~ 50.0', () => {
    expect(lerp(20,120,0.3)).toBeCloseTo(50.0, 5);
  });
  it('lerp(30,130,0.4) ~ 70.0', () => {
    expect(lerp(30,130,0.4)).toBeCloseTo(70.0, 5);
  });
  it('lerp(40,140,0.6) ~ 100.0', () => {
    expect(lerp(40,140,0.6)).toBeCloseTo(100.0, 5);
  });
  it('lerp(50,150,0.7) ~ 120.0', () => {
    expect(lerp(50,150,0.7)).toBeCloseTo(120.0, 5);
  });
  it('lerp(60,160,0.8) ~ 140.0', () => {
    expect(lerp(60,160,0.8)).toBeCloseTo(140.0, 5);
  });
  it('lerp(70,170,0.9) ~ 160.0', () => {
    expect(lerp(70,170,0.9)).toBeCloseTo(160.0, 5);
  });
  it('lerp(80,180,0.25) ~ 105.0', () => {
    expect(lerp(80,180,0.25)).toBeCloseTo(105.0, 5);
  });
  it('lerp(90,190,0.75) ~ 165.0', () => {
    expect(lerp(90,190,0.75)).toBeCloseTo(165.0, 5);
  });
});

describe('clamp01', () => {
  it('clamp01(-1) === 0', () => { expect(clamp01(-1)).toBe(0); });
  it('clamp01(-0.5) === 0', () => { expect(clamp01(-0.5)).toBe(0); });
  it('clamp01(-0.1) === 0', () => { expect(clamp01(-0.1)).toBe(0); });
  it('clamp01(-10) === 0', () => { expect(clamp01(-10)).toBe(0); });
  it('clamp01(-100) === 0', () => { expect(clamp01(-100)).toBe(0); });
  it('clamp01(-0.001) === 0', () => { expect(clamp01(-0.001)).toBe(0); });
  it('clamp01(1.001) === 1', () => { expect(clamp01(1.001)).toBe(1); });
  it('clamp01(1.1) === 1', () => { expect(clamp01(1.1)).toBe(1); });
  it('clamp01(2) === 1', () => { expect(clamp01(2)).toBe(1); });
  it('clamp01(10) === 1', () => { expect(clamp01(10)).toBe(1); });
  it('clamp01(100) === 1', () => { expect(clamp01(100)).toBe(1); });
  it('clamp01(1.5) === 1', () => { expect(clamp01(1.5)).toBe(1); });
  it('clamp01(0) === 0', () => { expect(clamp01(0)).toBe(0); });
  it('clamp01(1) === 1', () => { expect(clamp01(1)).toBe(1); });
  it('clamp01(0) ~ 0', () => {
    expect(clamp01(0)).toBeCloseTo(0, 5);
  });
  it('clamp01(0.011494252874) ~ 0.011494252874', () => {
    expect(clamp01(0.011494252874)).toBeCloseTo(0.011494252874, 5);
  });
  it('clamp01(0.022988505747) ~ 0.022988505747', () => {
    expect(clamp01(0.022988505747)).toBeCloseTo(0.022988505747, 5);
  });
  it('clamp01(0.034482758621) ~ 0.034482758621', () => {
    expect(clamp01(0.034482758621)).toBeCloseTo(0.034482758621, 5);
  });
  it('clamp01(0.045977011494) ~ 0.045977011494', () => {
    expect(clamp01(0.045977011494)).toBeCloseTo(0.045977011494, 5);
  });
  it('clamp01(0.057471264368) ~ 0.057471264368', () => {
    expect(clamp01(0.057471264368)).toBeCloseTo(0.057471264368, 5);
  });
  it('clamp01(0.068965517241) ~ 0.068965517241', () => {
    expect(clamp01(0.068965517241)).toBeCloseTo(0.068965517241, 5);
  });
  it('clamp01(0.080459770115) ~ 0.080459770115', () => {
    expect(clamp01(0.080459770115)).toBeCloseTo(0.080459770115, 5);
  });
  it('clamp01(0.091954022989) ~ 0.091954022989', () => {
    expect(clamp01(0.091954022989)).toBeCloseTo(0.091954022989, 5);
  });
  it('clamp01(0.103448275862) ~ 0.103448275862', () => {
    expect(clamp01(0.103448275862)).toBeCloseTo(0.103448275862, 5);
  });
  it('clamp01(0.114942528736) ~ 0.114942528736', () => {
    expect(clamp01(0.114942528736)).toBeCloseTo(0.114942528736, 5);
  });
  it('clamp01(0.126436781609) ~ 0.126436781609', () => {
    expect(clamp01(0.126436781609)).toBeCloseTo(0.126436781609, 5);
  });
  it('clamp01(0.137931034483) ~ 0.137931034483', () => {
    expect(clamp01(0.137931034483)).toBeCloseTo(0.137931034483, 5);
  });
  it('clamp01(0.149425287356) ~ 0.149425287356', () => {
    expect(clamp01(0.149425287356)).toBeCloseTo(0.149425287356, 5);
  });
  it('clamp01(0.16091954023) ~ 0.16091954023', () => {
    expect(clamp01(0.16091954023)).toBeCloseTo(0.16091954023, 5);
  });
  it('clamp01(0.172413793103) ~ 0.172413793103', () => {
    expect(clamp01(0.172413793103)).toBeCloseTo(0.172413793103, 5);
  });
  it('clamp01(0.183908045977) ~ 0.183908045977', () => {
    expect(clamp01(0.183908045977)).toBeCloseTo(0.183908045977, 5);
  });
  it('clamp01(0.195402298851) ~ 0.195402298851', () => {
    expect(clamp01(0.195402298851)).toBeCloseTo(0.195402298851, 5);
  });
  it('clamp01(0.206896551724) ~ 0.206896551724', () => {
    expect(clamp01(0.206896551724)).toBeCloseTo(0.206896551724, 5);
  });
  it('clamp01(0.218390804598) ~ 0.218390804598', () => {
    expect(clamp01(0.218390804598)).toBeCloseTo(0.218390804598, 5);
  });
  it('clamp01(0.229885057471) ~ 0.229885057471', () => {
    expect(clamp01(0.229885057471)).toBeCloseTo(0.229885057471, 5);
  });
  it('clamp01(0.241379310345) ~ 0.241379310345', () => {
    expect(clamp01(0.241379310345)).toBeCloseTo(0.241379310345, 5);
  });
  it('clamp01(0.252873563218) ~ 0.252873563218', () => {
    expect(clamp01(0.252873563218)).toBeCloseTo(0.252873563218, 5);
  });
  it('clamp01(0.264367816092) ~ 0.264367816092', () => {
    expect(clamp01(0.264367816092)).toBeCloseTo(0.264367816092, 5);
  });
  it('clamp01(0.275862068966) ~ 0.275862068966', () => {
    expect(clamp01(0.275862068966)).toBeCloseTo(0.275862068966, 5);
  });
  it('clamp01(0.287356321839) ~ 0.287356321839', () => {
    expect(clamp01(0.287356321839)).toBeCloseTo(0.287356321839, 5);
  });
  it('clamp01(0.298850574713) ~ 0.298850574713', () => {
    expect(clamp01(0.298850574713)).toBeCloseTo(0.298850574713, 5);
  });
  it('clamp01(0.310344827586) ~ 0.310344827586', () => {
    expect(clamp01(0.310344827586)).toBeCloseTo(0.310344827586, 5);
  });
  it('clamp01(0.32183908046) ~ 0.32183908046', () => {
    expect(clamp01(0.32183908046)).toBeCloseTo(0.32183908046, 5);
  });
  it('clamp01(0.333333333333) ~ 0.333333333333', () => {
    expect(clamp01(0.333333333333)).toBeCloseTo(0.333333333333, 5);
  });
  it('clamp01(0.344827586207) ~ 0.344827586207', () => {
    expect(clamp01(0.344827586207)).toBeCloseTo(0.344827586207, 5);
  });
  it('clamp01(0.35632183908) ~ 0.35632183908', () => {
    expect(clamp01(0.35632183908)).toBeCloseTo(0.35632183908, 5);
  });
  it('clamp01(0.367816091954) ~ 0.367816091954', () => {
    expect(clamp01(0.367816091954)).toBeCloseTo(0.367816091954, 5);
  });
  it('clamp01(0.379310344828) ~ 0.379310344828', () => {
    expect(clamp01(0.379310344828)).toBeCloseTo(0.379310344828, 5);
  });
  it('clamp01(0.390804597701) ~ 0.390804597701', () => {
    expect(clamp01(0.390804597701)).toBeCloseTo(0.390804597701, 5);
  });
  it('clamp01(0.402298850575) ~ 0.402298850575', () => {
    expect(clamp01(0.402298850575)).toBeCloseTo(0.402298850575, 5);
  });
  it('clamp01(0.413793103448) ~ 0.413793103448', () => {
    expect(clamp01(0.413793103448)).toBeCloseTo(0.413793103448, 5);
  });
  it('clamp01(0.425287356322) ~ 0.425287356322', () => {
    expect(clamp01(0.425287356322)).toBeCloseTo(0.425287356322, 5);
  });
  it('clamp01(0.436781609195) ~ 0.436781609195', () => {
    expect(clamp01(0.436781609195)).toBeCloseTo(0.436781609195, 5);
  });
  it('clamp01(0.448275862069) ~ 0.448275862069', () => {
    expect(clamp01(0.448275862069)).toBeCloseTo(0.448275862069, 5);
  });
  it('clamp01(0.459770114943) ~ 0.459770114943', () => {
    expect(clamp01(0.459770114943)).toBeCloseTo(0.459770114943, 5);
  });
  it('clamp01(0.471264367816) ~ 0.471264367816', () => {
    expect(clamp01(0.471264367816)).toBeCloseTo(0.471264367816, 5);
  });
  it('clamp01(0.48275862069) ~ 0.48275862069', () => {
    expect(clamp01(0.48275862069)).toBeCloseTo(0.48275862069, 5);
  });
  it('clamp01(0.494252873563) ~ 0.494252873563', () => {
    expect(clamp01(0.494252873563)).toBeCloseTo(0.494252873563, 5);
  });
  it('clamp01(0.505747126437) ~ 0.505747126437', () => {
    expect(clamp01(0.505747126437)).toBeCloseTo(0.505747126437, 5);
  });
  it('clamp01(0.51724137931) ~ 0.51724137931', () => {
    expect(clamp01(0.51724137931)).toBeCloseTo(0.51724137931, 5);
  });
  it('clamp01(0.528735632184) ~ 0.528735632184', () => {
    expect(clamp01(0.528735632184)).toBeCloseTo(0.528735632184, 5);
  });
  it('clamp01(0.540229885057) ~ 0.540229885057', () => {
    expect(clamp01(0.540229885057)).toBeCloseTo(0.540229885057, 5);
  });
  it('clamp01(0.551724137931) ~ 0.551724137931', () => {
    expect(clamp01(0.551724137931)).toBeCloseTo(0.551724137931, 5);
  });
  it('clamp01(0.563218390805) ~ 0.563218390805', () => {
    expect(clamp01(0.563218390805)).toBeCloseTo(0.563218390805, 5);
  });
  it('clamp01(0.574712643678) ~ 0.574712643678', () => {
    expect(clamp01(0.574712643678)).toBeCloseTo(0.574712643678, 5);
  });
  it('clamp01(0.586206896552) ~ 0.586206896552', () => {
    expect(clamp01(0.586206896552)).toBeCloseTo(0.586206896552, 5);
  });
  it('clamp01(0.597701149425) ~ 0.597701149425', () => {
    expect(clamp01(0.597701149425)).toBeCloseTo(0.597701149425, 5);
  });
  it('clamp01(0.609195402299) ~ 0.609195402299', () => {
    expect(clamp01(0.609195402299)).toBeCloseTo(0.609195402299, 5);
  });
  it('clamp01(0.620689655172) ~ 0.620689655172', () => {
    expect(clamp01(0.620689655172)).toBeCloseTo(0.620689655172, 5);
  });
  it('clamp01(0.632183908046) ~ 0.632183908046', () => {
    expect(clamp01(0.632183908046)).toBeCloseTo(0.632183908046, 5);
  });
  it('clamp01(0.64367816092) ~ 0.64367816092', () => {
    expect(clamp01(0.64367816092)).toBeCloseTo(0.64367816092, 5);
  });
  it('clamp01(0.655172413793) ~ 0.655172413793', () => {
    expect(clamp01(0.655172413793)).toBeCloseTo(0.655172413793, 5);
  });
  it('clamp01(0.666666666667) ~ 0.666666666667', () => {
    expect(clamp01(0.666666666667)).toBeCloseTo(0.666666666667, 5);
  });
  it('clamp01(0.67816091954) ~ 0.67816091954', () => {
    expect(clamp01(0.67816091954)).toBeCloseTo(0.67816091954, 5);
  });
  it('clamp01(0.689655172414) ~ 0.689655172414', () => {
    expect(clamp01(0.689655172414)).toBeCloseTo(0.689655172414, 5);
  });
  it('clamp01(0.701149425287) ~ 0.701149425287', () => {
    expect(clamp01(0.701149425287)).toBeCloseTo(0.701149425287, 5);
  });
  it('clamp01(0.712643678161) ~ 0.712643678161', () => {
    expect(clamp01(0.712643678161)).toBeCloseTo(0.712643678161, 5);
  });
  it('clamp01(0.724137931034) ~ 0.724137931034', () => {
    expect(clamp01(0.724137931034)).toBeCloseTo(0.724137931034, 5);
  });
  it('clamp01(0.735632183908) ~ 0.735632183908', () => {
    expect(clamp01(0.735632183908)).toBeCloseTo(0.735632183908, 5);
  });
  it('clamp01(0.747126436782) ~ 0.747126436782', () => {
    expect(clamp01(0.747126436782)).toBeCloseTo(0.747126436782, 5);
  });
  it('clamp01(0.758620689655) ~ 0.758620689655', () => {
    expect(clamp01(0.758620689655)).toBeCloseTo(0.758620689655, 5);
  });
  it('clamp01(0.770114942529) ~ 0.770114942529', () => {
    expect(clamp01(0.770114942529)).toBeCloseTo(0.770114942529, 5);
  });
  it('clamp01(0.781609195402) ~ 0.781609195402', () => {
    expect(clamp01(0.781609195402)).toBeCloseTo(0.781609195402, 5);
  });
  it('clamp01(0.793103448276) ~ 0.793103448276', () => {
    expect(clamp01(0.793103448276)).toBeCloseTo(0.793103448276, 5);
  });
  it('clamp01(0.804597701149) ~ 0.804597701149', () => {
    expect(clamp01(0.804597701149)).toBeCloseTo(0.804597701149, 5);
  });
  it('clamp01(0.816091954023) ~ 0.816091954023', () => {
    expect(clamp01(0.816091954023)).toBeCloseTo(0.816091954023, 5);
  });
  it('clamp01(0.827586206897) ~ 0.827586206897', () => {
    expect(clamp01(0.827586206897)).toBeCloseTo(0.827586206897, 5);
  });
  it('clamp01(0.83908045977) ~ 0.83908045977', () => {
    expect(clamp01(0.83908045977)).toBeCloseTo(0.83908045977, 5);
  });
  it('clamp01(0.850574712644) ~ 0.850574712644', () => {
    expect(clamp01(0.850574712644)).toBeCloseTo(0.850574712644, 5);
  });
  it('clamp01(0.862068965517) ~ 0.862068965517', () => {
    expect(clamp01(0.862068965517)).toBeCloseTo(0.862068965517, 5);
  });
  it('clamp01(0.873563218391) ~ 0.873563218391', () => {
    expect(clamp01(0.873563218391)).toBeCloseTo(0.873563218391, 5);
  });
  it('clamp01(0.885057471264) ~ 0.885057471264', () => {
    expect(clamp01(0.885057471264)).toBeCloseTo(0.885057471264, 5);
  });
  it('clamp01(0.896551724138) ~ 0.896551724138', () => {
    expect(clamp01(0.896551724138)).toBeCloseTo(0.896551724138, 5);
  });
  it('clamp01(0.908045977011) ~ 0.908045977011', () => {
    expect(clamp01(0.908045977011)).toBeCloseTo(0.908045977011, 5);
  });
  it('clamp01(0.919540229885) ~ 0.919540229885', () => {
    expect(clamp01(0.919540229885)).toBeCloseTo(0.919540229885, 5);
  });
  it('clamp01(0.931034482759) ~ 0.931034482759', () => {
    expect(clamp01(0.931034482759)).toBeCloseTo(0.931034482759, 5);
  });
  it('clamp01(0.942528735632) ~ 0.942528735632', () => {
    expect(clamp01(0.942528735632)).toBeCloseTo(0.942528735632, 5);
  });
  it('clamp01(0.954022988506) ~ 0.954022988506', () => {
    expect(clamp01(0.954022988506)).toBeCloseTo(0.954022988506, 5);
  });
  it('clamp01(0.965517241379) ~ 0.965517241379', () => {
    expect(clamp01(0.965517241379)).toBeCloseTo(0.965517241379, 5);
  });
  it('clamp01(0.977011494253) ~ 0.977011494253', () => {
    expect(clamp01(0.977011494253)).toBeCloseTo(0.977011494253, 5);
  });
  it('clamp01(0.988505747126) ~ 0.988505747126', () => {
    expect(clamp01(0.988505747126)).toBeCloseTo(0.988505747126, 5);
  });
  it('clamp01(1) ~ 1', () => {
    expect(clamp01(1)).toBeCloseTo(1, 5);
  });
});

describe('pingPong', () => {
  it('pingPong(0) ~ 0', () => {
    expect(pingPong(0)).toBeCloseTo(0, 5);
  });
  it('pingPong(0.1) ~ 0.1', () => {
    expect(pingPong(0.1)).toBeCloseTo(0.1, 5);
  });
  it('pingPong(0.2) ~ 0.2', () => {
    expect(pingPong(0.2)).toBeCloseTo(0.2, 5);
  });
  it('pingPong(0.3) ~ 0.3', () => {
    expect(pingPong(0.3)).toBeCloseTo(0.3, 5);
  });
  it('pingPong(0.4) ~ 0.4', () => {
    expect(pingPong(0.4)).toBeCloseTo(0.4, 5);
  });
  it('pingPong(0.5) ~ 0.5', () => {
    expect(pingPong(0.5)).toBeCloseTo(0.5, 5);
  });
  it('pingPong(0.6) ~ 0.6', () => {
    expect(pingPong(0.6)).toBeCloseTo(0.6, 5);
  });
  it('pingPong(0.7) ~ 0.7', () => {
    expect(pingPong(0.7)).toBeCloseTo(0.7, 5);
  });
  it('pingPong(0.8) ~ 0.8', () => {
    expect(pingPong(0.8)).toBeCloseTo(0.8, 5);
  });
  it('pingPong(0.9) ~ 0.9', () => {
    expect(pingPong(0.9)).toBeCloseTo(0.9, 5);
  });
  it('pingPong(1) ~ 1', () => {
    expect(pingPong(1)).toBeCloseTo(1, 5);
  });
  it('pingPong(1.1) ~ 0.9', () => {
    expect(pingPong(1.1)).toBeCloseTo(0.9, 5);
  });
  it('pingPong(1.2) ~ 0.8', () => {
    expect(pingPong(1.2)).toBeCloseTo(0.8, 5);
  });
  it('pingPong(1.3) ~ 0.7', () => {
    expect(pingPong(1.3)).toBeCloseTo(0.7, 5);
  });
  it('pingPong(1.4) ~ 0.6', () => {
    expect(pingPong(1.4)).toBeCloseTo(0.6, 5);
  });
  it('pingPong(1.5) ~ 0.5', () => {
    expect(pingPong(1.5)).toBeCloseTo(0.5, 5);
  });
  it('pingPong(1.6) ~ 0.4', () => {
    expect(pingPong(1.6)).toBeCloseTo(0.4, 5);
  });
  it('pingPong(1.7) ~ 0.3', () => {
    expect(pingPong(1.7)).toBeCloseTo(0.3, 5);
  });
  it('pingPong(1.8) ~ 0.2', () => {
    expect(pingPong(1.8)).toBeCloseTo(0.2, 5);
  });
  it('pingPong(1.9) ~ 0.1', () => {
    expect(pingPong(1.9)).toBeCloseTo(0.1, 5);
  });
  it('pingPong(2.0) ~ 0', () => {
    expect(pingPong(2.0)).toBeCloseTo(0, 5);
  });
  it('pingPong(2.1) ~ 0.1', () => {
    expect(pingPong(2.1)).toBeCloseTo(0.1, 5);
  });
  it('pingPong(2.2) ~ 0.2', () => {
    expect(pingPong(2.2)).toBeCloseTo(0.2, 5);
  });
  it('pingPong(2.3) ~ 0.3', () => {
    expect(pingPong(2.3)).toBeCloseTo(0.3, 5);
  });
  it('pingPong(2.4) ~ 0.4', () => {
    expect(pingPong(2.4)).toBeCloseTo(0.4, 5);
  });
  it('pingPong(2.5) ~ 0.5', () => {
    expect(pingPong(2.5)).toBeCloseTo(0.5, 5);
  });
  it('pingPong(2.6) ~ 0.6', () => {
    expect(pingPong(2.6)).toBeCloseTo(0.6, 5);
  });
  it('pingPong(2.7) ~ 0.7', () => {
    expect(pingPong(2.7)).toBeCloseTo(0.7, 5);
  });
  it('pingPong(2.8) ~ 0.8', () => {
    expect(pingPong(2.8)).toBeCloseTo(0.8, 5);
  });
  it('pingPong(2.9) ~ 0.9', () => {
    expect(pingPong(2.9)).toBeCloseTo(0.9, 5);
  });
  it('pingPong(3.0) ~ 1', () => {
    expect(pingPong(3.0)).toBeCloseTo(1, 5);
  });
  it('pingPong(3.1) ~ 0.9', () => {
    expect(pingPong(3.1)).toBeCloseTo(0.9, 5);
  });
  it('pingPong(3.2) ~ 0.8', () => {
    expect(pingPong(3.2)).toBeCloseTo(0.8, 5);
  });
  it('pingPong(3.3) ~ 0.7', () => {
    expect(pingPong(3.3)).toBeCloseTo(0.7, 5);
  });
  it('pingPong(3.4) ~ 0.6', () => {
    expect(pingPong(3.4)).toBeCloseTo(0.6, 5);
  });
  it('pingPong(3.5) ~ 0.5', () => {
    expect(pingPong(3.5)).toBeCloseTo(0.5, 5);
  });
  it('pingPong(3.6) ~ 0.4', () => {
    expect(pingPong(3.6)).toBeCloseTo(0.4, 5);
  });
  it('pingPong(3.7) ~ 0.3', () => {
    expect(pingPong(3.7)).toBeCloseTo(0.3, 5);
  });
  it('pingPong(3.8) ~ 0.2', () => {
    expect(pingPong(3.8)).toBeCloseTo(0.2, 5);
  });
  it('pingPong(3.9) ~ 0.1', () => {
    expect(pingPong(3.9)).toBeCloseTo(0.1, 5);
  });
  it('pingPong(4.0) ~ 0', () => {
    expect(pingPong(4.0)).toBeCloseTo(0, 5);
  });
  it('pingPong(4.1) ~ 0.1', () => {
    expect(pingPong(4.1)).toBeCloseTo(0.1, 5);
  });
  it('pingPong(4.2) ~ 0.2', () => {
    expect(pingPong(4.2)).toBeCloseTo(0.2, 5);
  });
  it('pingPong(4.3) ~ 0.3', () => {
    expect(pingPong(4.3)).toBeCloseTo(0.3, 5);
  });
  it('pingPong(4.4) ~ 0.4', () => {
    expect(pingPong(4.4)).toBeCloseTo(0.4, 5);
  });
  it('pingPong(4.5) ~ 0.5', () => {
    expect(pingPong(4.5)).toBeCloseTo(0.5, 5);
  });
  it('pingPong(4.6) ~ 0.6', () => {
    expect(pingPong(4.6)).toBeCloseTo(0.6, 5);
  });
  it('pingPong(4.7) ~ 0.7', () => {
    expect(pingPong(4.7)).toBeCloseTo(0.7, 5);
  });
  it('pingPong(4.8) ~ 0.8', () => {
    expect(pingPong(4.8)).toBeCloseTo(0.8, 5);
  });
  it('pingPong(4.9) ~ 0.9', () => {
    expect(pingPong(4.9)).toBeCloseTo(0.9, 5);
  });
});

describe('smoothstep', () => {
  it('smoothstep(0) ~ 0', () => {
    expect(smoothstep(0)).toBeCloseTo(0, 5);
  });
  it('smoothstep(0.020408163265) ~ 0.001232479664', () => {
    expect(smoothstep(0.020408163265)).toBeCloseTo(0.001232479664, 5);
  });
  it('smoothstep(0.040816326531) ~ 0.004861919778', () => {
    expect(smoothstep(0.040816326531)).toBeCloseTo(0.004861919778, 5);
  });
  it('smoothstep(0.061224489796) ~ 0.010786322026', () => {
    expect(smoothstep(0.061224489796)).toBeCloseTo(0.010786322026, 5);
  });
  it('smoothstep(0.081632653061) ~ 0.018903688089', () => {
    expect(smoothstep(0.081632653061)).toBeCloseTo(0.018903688089, 5);
  });
  it('smoothstep(0.102040816327) ~ 0.029112019652', () => {
    expect(smoothstep(0.102040816327)).toBeCloseTo(0.029112019652, 5);
  });
  it('smoothstep(0.122448979592) ~ 0.041309318396', () => {
    expect(smoothstep(0.122448979592)).toBeCloseTo(0.041309318396, 5);
  });
  it('smoothstep(0.142857142857) ~ 0.055393586006', () => {
    expect(smoothstep(0.142857142857)).toBeCloseTo(0.055393586006, 5);
  });
  it('smoothstep(0.163265306122) ~ 0.071262824163', () => {
    expect(smoothstep(0.163265306122)).toBeCloseTo(0.071262824163, 5);
  });
  it('smoothstep(0.183673469388) ~ 0.088815034552', () => {
    expect(smoothstep(0.183673469388)).toBeCloseTo(0.088815034552, 5);
  });
  it('smoothstep(0.204081632653) ~ 0.107948218854', () => {
    expect(smoothstep(0.204081632653)).toBeCloseTo(0.107948218854, 5);
  });
  it('smoothstep(0.224489795918) ~ 0.128560378754', () => {
    expect(smoothstep(0.224489795918)).toBeCloseTo(0.128560378754, 5);
  });
  it('smoothstep(0.244897959184) ~ 0.150549515933', () => {
    expect(smoothstep(0.244897959184)).toBeCloseTo(0.150549515933, 5);
  });
  it('smoothstep(0.265306122449) ~ 0.173813632075', () => {
    expect(smoothstep(0.265306122449)).toBeCloseTo(0.173813632075, 5);
  });
  it('smoothstep(0.285714285714) ~ 0.198250728863', () => {
    expect(smoothstep(0.285714285714)).toBeCloseTo(0.198250728863, 5);
  });
  it('smoothstep(0.30612244898) ~ 0.22375880798', () => {
    expect(smoothstep(0.30612244898)).toBeCloseTo(0.22375880798, 5);
  });
  it('smoothstep(0.326530612245) ~ 0.250235871108', () => {
    expect(smoothstep(0.326530612245)).toBeCloseTo(0.250235871108, 5);
  });
  it('smoothstep(0.34693877551) ~ 0.277579919931', () => {
    expect(smoothstep(0.34693877551)).toBeCloseTo(0.277579919931, 5);
  });
  it('smoothstep(0.367346938776) ~ 0.305688956132', () => {
    expect(smoothstep(0.367346938776)).toBeCloseTo(0.305688956132, 5);
  });
  it('smoothstep(0.387755102041) ~ 0.334460981394', () => {
    expect(smoothstep(0.387755102041)).toBeCloseTo(0.334460981394, 5);
  });
  it('smoothstep(0.408163265306) ~ 0.363793997399', () => {
    expect(smoothstep(0.408163265306)).toBeCloseTo(0.363793997399, 5);
  });
  it('smoothstep(0.428571428571) ~ 0.393586005831', () => {
    expect(smoothstep(0.428571428571)).toBeCloseTo(0.393586005831, 5);
  });
  it('smoothstep(0.448979591837) ~ 0.423735008372', () => {
    expect(smoothstep(0.448979591837)).toBeCloseTo(0.423735008372, 5);
  });
  it('smoothstep(0.469387755102) ~ 0.454139006706', () => {
    expect(smoothstep(0.469387755102)).toBeCloseTo(0.454139006706, 5);
  });
  it('smoothstep(0.489795918367) ~ 0.484696002516', () => {
    expect(smoothstep(0.489795918367)).toBeCloseTo(0.484696002516, 5);
  });
  it('smoothstep(0.510204081633) ~ 0.515303997484', () => {
    expect(smoothstep(0.510204081633)).toBeCloseTo(0.515303997484, 5);
  });
  it('smoothstep(0.530612244898) ~ 0.545860993294', () => {
    expect(smoothstep(0.530612244898)).toBeCloseTo(0.545860993294, 5);
  });
  it('smoothstep(0.551020408163) ~ 0.576264991628', () => {
    expect(smoothstep(0.551020408163)).toBeCloseTo(0.576264991628, 5);
  });
  it('smoothstep(0.571428571429) ~ 0.606413994169', () => {
    expect(smoothstep(0.571428571429)).toBeCloseTo(0.606413994169, 5);
  });
  it('smoothstep(0.591836734694) ~ 0.636206002601', () => {
    expect(smoothstep(0.591836734694)).toBeCloseTo(0.636206002601, 5);
  });
  it('smoothstep(0.612244897959) ~ 0.665539018606', () => {
    expect(smoothstep(0.612244897959)).toBeCloseTo(0.665539018606, 5);
  });
  it('smoothstep(0.632653061224) ~ 0.694311043868', () => {
    expect(smoothstep(0.632653061224)).toBeCloseTo(0.694311043868, 5);
  });
  it('smoothstep(0.65306122449) ~ 0.722420080069', () => {
    expect(smoothstep(0.65306122449)).toBeCloseTo(0.722420080069, 5);
  });
  it('smoothstep(0.673469387755) ~ 0.749764128892', () => {
    expect(smoothstep(0.673469387755)).toBeCloseTo(0.749764128892, 5);
  });
  it('smoothstep(0.69387755102) ~ 0.77624119202', () => {
    expect(smoothstep(0.69387755102)).toBeCloseTo(0.77624119202, 5);
  });
  it('smoothstep(0.714285714286) ~ 0.801749271137', () => {
    expect(smoothstep(0.714285714286)).toBeCloseTo(0.801749271137, 5);
  });
  it('smoothstep(0.734693877551) ~ 0.826186367925', () => {
    expect(smoothstep(0.734693877551)).toBeCloseTo(0.826186367925, 5);
  });
  it('smoothstep(0.755102040816) ~ 0.849450484067', () => {
    expect(smoothstep(0.755102040816)).toBeCloseTo(0.849450484067, 5);
  });
  it('smoothstep(0.775510204082) ~ 0.871439621246', () => {
    expect(smoothstep(0.775510204082)).toBeCloseTo(0.871439621246, 5);
  });
  it('smoothstep(0.795918367347) ~ 0.892051781146', () => {
    expect(smoothstep(0.795918367347)).toBeCloseTo(0.892051781146, 5);
  });
  it('smoothstep(0.816326530612) ~ 0.911184965448', () => {
    expect(smoothstep(0.816326530612)).toBeCloseTo(0.911184965448, 5);
  });
  it('smoothstep(0.836734693878) ~ 0.928737175837', () => {
    expect(smoothstep(0.836734693878)).toBeCloseTo(0.928737175837, 5);
  });
  it('smoothstep(0.857142857143) ~ 0.944606413994', () => {
    expect(smoothstep(0.857142857143)).toBeCloseTo(0.944606413994, 5);
  });
  it('smoothstep(0.877551020408) ~ 0.958690681604', () => {
    expect(smoothstep(0.877551020408)).toBeCloseTo(0.958690681604, 5);
  });
  it('smoothstep(0.897959183673) ~ 0.970887980348', () => {
    expect(smoothstep(0.897959183673)).toBeCloseTo(0.970887980348, 5);
  });
  it('smoothstep(0.918367346939) ~ 0.981096311911', () => {
    expect(smoothstep(0.918367346939)).toBeCloseTo(0.981096311911, 5);
  });
  it('smoothstep(0.938775510204) ~ 0.989213677974', () => {
    expect(smoothstep(0.938775510204)).toBeCloseTo(0.989213677974, 5);
  });
  it('smoothstep(0.959183673469) ~ 0.995138080222', () => {
    expect(smoothstep(0.959183673469)).toBeCloseTo(0.995138080222, 5);
  });
  it('smoothstep(0.979591836735) ~ 0.998767520336', () => {
    expect(smoothstep(0.979591836735)).toBeCloseTo(0.998767520336, 5);
  });
  it('smoothstep(1) ~ 1', () => {
    expect(smoothstep(1)).toBeCloseTo(1, 5);
  });
});

describe('smootherstep', () => {
  it('smootherstep(0) ~ 0', () => {
    expect(smootherstep(0)).toBeCloseTo(0, 5);
  });
  it('smootherstep(0.020408163265) ~ 8.241784e-05', () => {
    expect(smootherstep(0.020408163265)).toBeCloseTo(8.241784e-05, 5);
  });
  it('smootherstep(0.040816326531) ~ 0.00063903652', () => {
    expect(smootherstep(0.040816326531)).toBeCloseTo(0.00063903652, 5);
  });
  it('smootherstep(0.061224489796) ~ 0.002089361819', () => {
    expect(smootherstep(0.061224489796)).toBeCloseTo(0.002089361819, 5);
  });
  it('smootherstep(0.081632653061) ~ 0.004795549362', () => {
    expect(smootherstep(0.081632653061)).toBeCloseTo(0.004795549362, 5);
  });
  it('smootherstep(0.102040816327) ~ 0.00906495351', () => {
    expect(smootherstep(0.102040816327)).toBeCloseTo(0.00906495351, 5);
  });
  it('smootherstep(0.122448979592) ~ 0.015152676262', () => {
    expect(smootherstep(0.122448979592)).toBeCloseTo(0.015152676262, 5);
  });
  it('smootherstep(0.142857142857) ~ 0.023264116142', () => {
    expect(smootherstep(0.142857142857)).toBeCloseTo(0.023264116142, 5);
  });
  it('smootherstep(0.163265306122) ~ 0.033557517105', () => {
    expect(smootherstep(0.163265306122)).toBeCloseTo(0.033557517105, 5);
  });
  it('smootherstep(0.183673469388) ~ 0.046146517425', () => {
    expect(smootherstep(0.183673469388)).toBeCloseTo(0.046146517425, 5);
  });
  it('smootherstep(0.204081632653) ~ 0.061102698594', () => {
    expect(smootherstep(0.204081632653)).toBeCloseTo(0.061102698594, 5);
  });
  it('smootherstep(0.224489795918) ~ 0.07845813422', () => {
    expect(smootherstep(0.224489795918)).toBeCloseTo(0.07845813422, 5);
  });
  it('smootherstep(0.244897959184) ~ 0.098207938919', () => {
    expect(smootherstep(0.244897959184)).toBeCloseTo(0.098207938919, 5);
  });
  it('smootherstep(0.265306122449) ~ 0.120312817213', () => {
    expect(smootherstep(0.265306122449)).toBeCloseTo(0.120312817213, 5);
  });
  it('smootherstep(0.285714285714) ~ 0.144701612423', () => {
    expect(smootherstep(0.285714285714)).toBeCloseTo(0.144701612423, 5);
  });
  it('smootherstep(0.30612244898) ~ 0.171273855572', () => {
    expect(smootherstep(0.30612244898)).toBeCloseTo(0.171273855572, 5);
  });
  it('smootherstep(0.326530612245) ~ 0.199902314273', () => {
    expect(smootherstep(0.326530612245)).toBeCloseTo(0.199902314273, 5);
  });
  it('smootherstep(0.34693877551) ~ 0.230435541629', () => {
    expect(smootherstep(0.34693877551)).toBeCloseTo(0.230435541629, 5);
  });
  it('smootherstep(0.367346938776) ~ 0.262700425126', () => {
    expect(smootherstep(0.367346938776)).toBeCloseTo(0.262700425126, 5);
  });
  it('smootherstep(0.387755102041) ~ 0.296504735535', () => {
    expect(smootherstep(0.387755102041)).toBeCloseTo(0.296504735535, 5);
  });
  it('smootherstep(0.408163265306) ~ 0.3316396758', () => {
    expect(smootherstep(0.408163265306)).toBeCloseTo(0.3316396758, 5);
  });
  it('smootherstep(0.428571428571) ~ 0.36788242994', () => {
    expect(smootherstep(0.428571428571)).toBeCloseTo(0.36788242994, 5);
  });
  it('smootherstep(0.448979591837) ~ 0.40499871194', () => {
    expect(smootherstep(0.448979591837)).toBeCloseTo(0.40499871194, 5);
  });
  it('smootherstep(0.469387755102) ~ 0.442745314652', () => {
    expect(smootherstep(0.469387755102)).toBeCloseTo(0.442745314652, 5);
  });
  it('smootherstep(0.489795918367) ~ 0.480872658687', () => {
    expect(smootherstep(0.489795918367)).toBeCloseTo(0.480872658687, 5);
  });
  it('smootherstep(0.510204081633) ~ 0.519127341313', () => {
    expect(smootherstep(0.510204081633)).toBeCloseTo(0.519127341313, 5);
  });
  it('smootherstep(0.530612244898) ~ 0.557254685348', () => {
    expect(smootherstep(0.530612244898)).toBeCloseTo(0.557254685348, 5);
  });
  it('smootherstep(0.551020408163) ~ 0.59500128806', () => {
    expect(smootherstep(0.551020408163)).toBeCloseTo(0.59500128806, 5);
  });
  it('smootherstep(0.571428571429) ~ 0.63211757006', () => {
    expect(smootherstep(0.571428571429)).toBeCloseTo(0.63211757006, 5);
  });
  it('smootherstep(0.591836734694) ~ 0.6683603242', () => {
    expect(smootherstep(0.591836734694)).toBeCloseTo(0.6683603242, 5);
  });
  it('smootherstep(0.612244897959) ~ 0.703495264465', () => {
    expect(smootherstep(0.612244897959)).toBeCloseTo(0.703495264465, 5);
  });
  it('smootherstep(0.632653061224) ~ 0.737299574874', () => {
    expect(smootherstep(0.632653061224)).toBeCloseTo(0.737299574874, 5);
  });
  it('smootherstep(0.65306122449) ~ 0.769564458371', () => {
    expect(smootherstep(0.65306122449)).toBeCloseTo(0.769564458371, 5);
  });
  it('smootherstep(0.673469387755) ~ 0.800097685727', () => {
    expect(smootherstep(0.673469387755)).toBeCloseTo(0.800097685727, 5);
  });
  it('smootherstep(0.69387755102) ~ 0.828726144428', () => {
    expect(smootherstep(0.69387755102)).toBeCloseTo(0.828726144428, 5);
  });
  it('smootherstep(0.714285714286) ~ 0.855298387577', () => {
    expect(smootherstep(0.714285714286)).toBeCloseTo(0.855298387577, 5);
  });
  it('smootherstep(0.734693877551) ~ 0.879687182787', () => {
    expect(smootherstep(0.734693877551)).toBeCloseTo(0.879687182787, 5);
  });
  it('smootherstep(0.755102040816) ~ 0.901792061081', () => {
    expect(smootherstep(0.755102040816)).toBeCloseTo(0.901792061081, 5);
  });
  it('smootherstep(0.775510204082) ~ 0.92154186578', () => {
    expect(smootherstep(0.775510204082)).toBeCloseTo(0.92154186578, 5);
  });
  it('smootherstep(0.795918367347) ~ 0.938897301406', () => {
    expect(smootherstep(0.795918367347)).toBeCloseTo(0.938897301406, 5);
  });
  it('smootherstep(0.816326530612) ~ 0.953853482575', () => {
    expect(smootherstep(0.816326530612)).toBeCloseTo(0.953853482575, 5);
  });
  it('smootherstep(0.836734693878) ~ 0.966442482895', () => {
    expect(smootherstep(0.836734693878)).toBeCloseTo(0.966442482895, 5);
  });
  it('smootherstep(0.857142857143) ~ 0.976735883858', () => {
    expect(smootherstep(0.857142857143)).toBeCloseTo(0.976735883858, 5);
  });
  it('smootherstep(0.877551020408) ~ 0.984847323738', () => {
    expect(smootherstep(0.877551020408)).toBeCloseTo(0.984847323738, 5);
  });
  it('smootherstep(0.897959183673) ~ 0.99093504649', () => {
    expect(smootherstep(0.897959183673)).toBeCloseTo(0.99093504649, 5);
  });
  it('smootherstep(0.918367346939) ~ 0.995204450638', () => {
    expect(smootherstep(0.918367346939)).toBeCloseTo(0.995204450638, 5);
  });
  it('smootherstep(0.938775510204) ~ 0.997910638181', () => {
    expect(smootherstep(0.938775510204)).toBeCloseTo(0.997910638181, 5);
  });
  it('smootherstep(0.959183673469) ~ 0.99936096348', () => {
    expect(smootherstep(0.959183673469)).toBeCloseTo(0.99936096348, 5);
  });
  it('smootherstep(0.979591836735) ~ 0.99991758216', () => {
    expect(smootherstep(0.979591836735)).toBeCloseTo(0.99991758216, 5);
  });
  it('smootherstep(1) ~ 1', () => {
    expect(smootherstep(1)).toBeCloseTo(1, 5);
  });
});

describe('interpolateKeyframes', () => {
  it('empty keyframes returns 0', () => {
    expect(interpolateKeyframes([], 0.5)).toBe(0);
  });
  it('single keyframe always returns its value', () => {
    expect(interpolateKeyframes([{time:0,value:42}], 0.5)).toBe(42);
  });
  it('t before first keyframe returns first value', () => {
    expect(interpolateKeyframes([{time:0.2,value:10},{time:0.8,value:20}], 0)).toBeCloseTo(10, 5);
  });
  it('t after last keyframe returns last value', () => {
    expect(interpolateKeyframes([{time:0.2,value:10},{time:0.8,value:20}], 1)).toBeCloseTo(20, 5);
  });
  it('t exactly at first keyframe returns first value', () => {
    expect(interpolateKeyframes([{time:0,value:5},{time:1,value:15}], 0)).toBeCloseTo(5, 5);
  });
  it('t exactly at last keyframe returns last value', () => {
    expect(interpolateKeyframes([{time:0,value:5},{time:1,value:15}], 1)).toBeCloseTo(15, 5);
  });
  it('0→100 at t=0', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0)).toBeCloseTo(0, 5);
  });
  it('0→100 at t=0.025641025641', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.025641025641)).toBeCloseTo(2.564102564103, 5);
  });
  it('0→100 at t=0.051282051282', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.051282051282)).toBeCloseTo(5.128205128205, 5);
  });
  it('0→100 at t=0.076923076923', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.076923076923)).toBeCloseTo(7.692307692308, 5);
  });
  it('0→100 at t=0.102564102564', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.102564102564)).toBeCloseTo(10.25641025641, 5);
  });
  it('0→100 at t=0.128205128205', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.128205128205)).toBeCloseTo(12.820512820513, 5);
  });
  it('0→100 at t=0.153846153846', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.153846153846)).toBeCloseTo(15.384615384615, 5);
  });
  it('0→100 at t=0.179487179487', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.179487179487)).toBeCloseTo(17.948717948718, 5);
  });
  it('0→100 at t=0.205128205128', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.205128205128)).toBeCloseTo(20.512820512821, 5);
  });
  it('0→100 at t=0.230769230769', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.230769230769)).toBeCloseTo(23.076923076923, 5);
  });
  it('0→100 at t=0.25641025641', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.25641025641)).toBeCloseTo(25.641025641026, 5);
  });
  it('0→100 at t=0.282051282051', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.282051282051)).toBeCloseTo(28.205128205128, 5);
  });
  it('0→100 at t=0.307692307692', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.307692307692)).toBeCloseTo(30.769230769231, 5);
  });
  it('0→100 at t=0.333333333333', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.333333333333)).toBeCloseTo(33.333333333333, 5);
  });
  it('0→100 at t=0.358974358974', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.358974358974)).toBeCloseTo(35.897435897436, 5);
  });
  it('0→100 at t=0.384615384615', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.384615384615)).toBeCloseTo(38.461538461538, 5);
  });
  it('0→100 at t=0.410256410256', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.410256410256)).toBeCloseTo(41.025641025641, 5);
  });
  it('0→100 at t=0.435897435897', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.435897435897)).toBeCloseTo(43.589743589744, 5);
  });
  it('0→100 at t=0.461538461538', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.461538461538)).toBeCloseTo(46.153846153846, 5);
  });
  it('0→100 at t=0.487179487179', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.487179487179)).toBeCloseTo(48.717948717949, 5);
  });
  it('0→100 at t=0.512820512821', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.512820512821)).toBeCloseTo(51.282051282051, 5);
  });
  it('0→100 at t=0.538461538462', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.538461538462)).toBeCloseTo(53.846153846154, 5);
  });
  it('0→100 at t=0.564102564103', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.564102564103)).toBeCloseTo(56.410256410256, 5);
  });
  it('0→100 at t=0.589743589744', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.589743589744)).toBeCloseTo(58.974358974359, 5);
  });
  it('0→100 at t=0.615384615385', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.615384615385)).toBeCloseTo(61.538461538462, 5);
  });
  it('0→100 at t=0.641025641026', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.641025641026)).toBeCloseTo(64.102564102564, 5);
  });
  it('0→100 at t=0.666666666667', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.666666666667)).toBeCloseTo(66.666666666667, 5);
  });
  it('0→100 at t=0.692307692308', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.692307692308)).toBeCloseTo(69.230769230769, 5);
  });
  it('0→100 at t=0.717948717949', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.717948717949)).toBeCloseTo(71.794871794872, 5);
  });
  it('0→100 at t=0.74358974359', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.74358974359)).toBeCloseTo(74.358974358974, 5);
  });
  it('0→100 at t=0.769230769231', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.769230769231)).toBeCloseTo(76.923076923077, 5);
  });
  it('0→100 at t=0.794871794872', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.794871794872)).toBeCloseTo(79.487179487179, 5);
  });
  it('0→100 at t=0.820512820513', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.820512820513)).toBeCloseTo(82.051282051282, 5);
  });
  it('0→100 at t=0.846153846154', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.846153846154)).toBeCloseTo(84.615384615385, 5);
  });
  it('0→100 at t=0.871794871795', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.871794871795)).toBeCloseTo(87.179487179487, 5);
  });
  it('0→100 at t=0.897435897436', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.897435897436)).toBeCloseTo(89.74358974359, 5);
  });
  it('0→100 at t=0.923076923077', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.923076923077)).toBeCloseTo(92.307692307692, 5);
  });
  it('0→100 at t=0.948717948718', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.948717948718)).toBeCloseTo(94.871794871795, 5);
  });
  it('0→100 at t=0.974358974359', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 0.974358974359)).toBeCloseTo(97.435897435897, 5);
  });
  it('0→100 at t=1', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:1,value:100}], 1)).toBeCloseTo(100.0, 5);
  });
  it('3-kf at t=0', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0)).toBeCloseTo(0, 5);
  });
  it('3-kf at t=0.020408163265', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.020408163265)).toBeCloseTo(2.040816326531, 5);
  });
  it('3-kf at t=0.040816326531', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.040816326531)).toBeCloseTo(4.081632653061, 5);
  });
  it('3-kf at t=0.061224489796', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.061224489796)).toBeCloseTo(6.122448979592, 5);
  });
  it('3-kf at t=0.081632653061', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.081632653061)).toBeCloseTo(8.163265306122, 5);
  });
  it('3-kf at t=0.102040816327', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.102040816327)).toBeCloseTo(10.204081632653, 5);
  });
  it('3-kf at t=0.122448979592', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.122448979592)).toBeCloseTo(12.244897959184, 5);
  });
  it('3-kf at t=0.142857142857', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.142857142857)).toBeCloseTo(14.285714285714, 5);
  });
  it('3-kf at t=0.163265306122', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.163265306122)).toBeCloseTo(16.326530612245, 5);
  });
  it('3-kf at t=0.183673469388', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.183673469388)).toBeCloseTo(18.367346938776, 5);
  });
  it('3-kf at t=0.204081632653', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.204081632653)).toBeCloseTo(20.408163265306, 5);
  });
  it('3-kf at t=0.224489795918', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.224489795918)).toBeCloseTo(22.448979591837, 5);
  });
  it('3-kf at t=0.244897959184', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.244897959184)).toBeCloseTo(24.489795918367, 5);
  });
  it('3-kf at t=0.265306122449', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.265306122449)).toBeCloseTo(26.530612244898, 5);
  });
  it('3-kf at t=0.285714285714', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.285714285714)).toBeCloseTo(28.571428571429, 5);
  });
  it('3-kf at t=0.30612244898', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.30612244898)).toBeCloseTo(30.612244897959, 5);
  });
  it('3-kf at t=0.326530612245', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.326530612245)).toBeCloseTo(32.65306122449, 5);
  });
  it('3-kf at t=0.34693877551', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.34693877551)).toBeCloseTo(34.69387755102, 5);
  });
  it('3-kf at t=0.367346938776', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.367346938776)).toBeCloseTo(36.734693877551, 5);
  });
  it('3-kf at t=0.387755102041', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.387755102041)).toBeCloseTo(38.775510204082, 5);
  });
  it('3-kf at t=0.408163265306', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.408163265306)).toBeCloseTo(40.816326530612, 5);
  });
  it('3-kf at t=0.428571428571', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.428571428571)).toBeCloseTo(42.857142857143, 5);
  });
  it('3-kf at t=0.448979591837', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.448979591837)).toBeCloseTo(44.897959183673, 5);
  });
  it('3-kf at t=0.469387755102', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.469387755102)).toBeCloseTo(46.938775510204, 5);
  });
  it('3-kf at t=0.489795918367', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.489795918367)).toBeCloseTo(48.979591836735, 5);
  });
  it('3-kf at t=0.510204081633', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.510204081633)).toBeCloseTo(51.020408163265, 5);
  });
  it('3-kf at t=0.530612244898', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.530612244898)).toBeCloseTo(53.061224489796, 5);
  });
  it('3-kf at t=0.551020408163', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.551020408163)).toBeCloseTo(55.102040816327, 5);
  });
  it('3-kf at t=0.571428571429', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.571428571429)).toBeCloseTo(57.142857142857, 5);
  });
  it('3-kf at t=0.591836734694', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.591836734694)).toBeCloseTo(59.183673469388, 5);
  });
  it('3-kf at t=0.612244897959', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.612244897959)).toBeCloseTo(61.224489795918, 5);
  });
  it('3-kf at t=0.632653061224', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.632653061224)).toBeCloseTo(63.265306122449, 5);
  });
  it('3-kf at t=0.65306122449', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.65306122449)).toBeCloseTo(65.30612244898, 5);
  });
  it('3-kf at t=0.673469387755', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.673469387755)).toBeCloseTo(67.34693877551, 5);
  });
  it('3-kf at t=0.69387755102', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.69387755102)).toBeCloseTo(69.387755102041, 5);
  });
  it('3-kf at t=0.714285714286', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.714285714286)).toBeCloseTo(71.428571428571, 5);
  });
  it('3-kf at t=0.734693877551', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.734693877551)).toBeCloseTo(73.469387755102, 5);
  });
  it('3-kf at t=0.755102040816', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.755102040816)).toBeCloseTo(75.510204081633, 5);
  });
  it('3-kf at t=0.775510204082', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.775510204082)).toBeCloseTo(77.551020408163, 5);
  });
  it('3-kf at t=0.795918367347', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.795918367347)).toBeCloseTo(79.591836734694, 5);
  });
  it('3-kf at t=0.816326530612', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.816326530612)).toBeCloseTo(81.632653061224, 5);
  });
  it('3-kf at t=0.836734693878', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.836734693878)).toBeCloseTo(83.673469387755, 5);
  });
  it('3-kf at t=0.857142857143', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.857142857143)).toBeCloseTo(85.714285714286, 5);
  });
  it('3-kf at t=0.877551020408', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.877551020408)).toBeCloseTo(87.755102040816, 5);
  });
  it('3-kf at t=0.897959183673', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.897959183673)).toBeCloseTo(89.795918367347, 5);
  });
  it('3-kf at t=0.918367346939', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.918367346939)).toBeCloseTo(91.836734693878, 5);
  });
  it('3-kf at t=0.938775510204', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.938775510204)).toBeCloseTo(93.877551020408, 5);
  });
  it('3-kf at t=0.959183673469', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.959183673469)).toBeCloseTo(95.918367346939, 5);
  });
  it('3-kf at t=0.979591836735', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 0.979591836735)).toBeCloseTo(97.959183673469, 5);
  });
  it('3-kf at t=1', () => {
    expect(interpolateKeyframes([{time:0,value:0},{time:0.5,value:50},{time:1,value:100}], 1)).toBeCloseTo(100.0, 5);
  });
});

describe('springValue', () => {
  it('spring converges toward target over many steps', () => {
    let v = 0, c = 0;
    for (let i = 0; i < 200; i++) {
      const r = springValue(c, 1, v, 200, 20, 0.016);
      c = r.value; v = r.velocity;
    }
    expect(c).toBeCloseTo(1, 1);
  });
  it('no change when at rest at target', () => {
    const r = springValue(1, 1, 0, 100, 20, 0.016);
    expect(r.value).toBeCloseTo(1, 10);
    expect(r.velocity).toBeCloseTo(0, 10);
  });
  it('moves toward target on first step from 0 to 1', () => {
    const r = springValue(0, 1, 0, 100, 10, 0.016);
    expect(r.value).toBeGreaterThan(0);
  });
  it('moves toward target on first step from 2 to 1', () => {
    const r = springValue(2, 1, 0, 100, 10, 0.016);
    expect(r.value).toBeLessThan(2);
  });
  it('spring step from 0 to target=5 gives value~0.128', () => {
    const r = springValue(0, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.128, 5);
    expect(r.velocity).toBeCloseTo(8.0, 5);
  });
  it('spring step from 0.1 to target=5 gives value~0.22544', () => {
    const r = springValue(0.1, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.22544, 5);
    expect(r.velocity).toBeCloseTo(7.84, 5);
  });
  it('spring step from 0.2 to target=5 gives value~0.32288', () => {
    const r = springValue(0.2, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.32288, 5);
    expect(r.velocity).toBeCloseTo(7.68, 5);
  });
  it('spring step from 0.3 to target=5 gives value~0.42032', () => {
    const r = springValue(0.3, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.42032, 5);
    expect(r.velocity).toBeCloseTo(7.52, 5);
  });
  it('spring step from 0.4 to target=5 gives value~0.51776', () => {
    const r = springValue(0.4, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.51776, 5);
    expect(r.velocity).toBeCloseTo(7.36, 5);
  });
  it('spring step from 0.5 to target=5 gives value~0.6152', () => {
    const r = springValue(0.5, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.6152, 5);
    expect(r.velocity).toBeCloseTo(7.2, 5);
  });
  it('spring step from 0.6 to target=5 gives value~0.71264', () => {
    const r = springValue(0.6, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.71264, 5);
    expect(r.velocity).toBeCloseTo(7.04, 5);
  });
  it('spring step from 0.7 to target=5 gives value~0.81008', () => {
    const r = springValue(0.7, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.81008, 5);
    expect(r.velocity).toBeCloseTo(6.88, 5);
  });
  it('spring step from 0.8 to target=5 gives value~0.90752', () => {
    const r = springValue(0.8, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(0.90752, 5);
    expect(r.velocity).toBeCloseTo(6.72, 5);
  });
  it('spring step from 0.9 to target=5 gives value~1.00496', () => {
    const r = springValue(0.9, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.00496, 5);
    expect(r.velocity).toBeCloseTo(6.56, 5);
  });
  it('spring step from 1 to target=5 gives value~1.1024', () => {
    const r = springValue(1, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.1024, 5);
    expect(r.velocity).toBeCloseTo(6.4, 5);
  });
  it('spring step from 1.1 to target=5 gives value~1.19984', () => {
    const r = springValue(1.1, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.19984, 5);
    expect(r.velocity).toBeCloseTo(6.24, 5);
  });
  it('spring step from 1.2 to target=5 gives value~1.29728', () => {
    const r = springValue(1.2, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.29728, 5);
    expect(r.velocity).toBeCloseTo(6.08, 5);
  });
  it('spring step from 1.3 to target=5 gives value~1.39472', () => {
    const r = springValue(1.3, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.39472, 5);
    expect(r.velocity).toBeCloseTo(5.92, 5);
  });
  it('spring step from 1.4 to target=5 gives value~1.49216', () => {
    const r = springValue(1.4, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.49216, 5);
    expect(r.velocity).toBeCloseTo(5.76, 5);
  });
  it('spring step from 1.5 to target=5 gives value~1.5896', () => {
    const r = springValue(1.5, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.5896, 5);
    expect(r.velocity).toBeCloseTo(5.6, 5);
  });
  it('spring step from 1.6 to target=5 gives value~1.68704', () => {
    const r = springValue(1.6, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.68704, 5);
    expect(r.velocity).toBeCloseTo(5.44, 5);
  });
  it('spring step from 1.7 to target=5 gives value~1.78448', () => {
    const r = springValue(1.7, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.78448, 5);
    expect(r.velocity).toBeCloseTo(5.28, 5);
  });
  it('spring step from 1.8 to target=5 gives value~1.88192', () => {
    const r = springValue(1.8, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.88192, 5);
    expect(r.velocity).toBeCloseTo(5.12, 5);
  });
  it('spring step from 1.9 to target=5 gives value~1.97936', () => {
    const r = springValue(1.9, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(1.97936, 5);
    expect(r.velocity).toBeCloseTo(4.96, 5);
  });
  it('spring step from 2.0 to target=5 gives value~2.0768', () => {
    const r = springValue(2.0, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.0768, 5);
    expect(r.velocity).toBeCloseTo(4.8, 5);
  });
  it('spring step from 2.1 to target=5 gives value~2.17424', () => {
    const r = springValue(2.1, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.17424, 5);
    expect(r.velocity).toBeCloseTo(4.64, 5);
  });
  it('spring step from 2.2 to target=5 gives value~2.27168', () => {
    const r = springValue(2.2, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.27168, 5);
    expect(r.velocity).toBeCloseTo(4.48, 5);
  });
  it('spring step from 2.3 to target=5 gives value~2.36912', () => {
    const r = springValue(2.3, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.36912, 5);
    expect(r.velocity).toBeCloseTo(4.32, 5);
  });
  it('spring step from 2.4 to target=5 gives value~2.46656', () => {
    const r = springValue(2.4, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.46656, 5);
    expect(r.velocity).toBeCloseTo(4.16, 5);
  });
  it('spring step from 2.5 to target=5 gives value~2.564', () => {
    const r = springValue(2.5, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.564, 5);
    expect(r.velocity).toBeCloseTo(4.0, 5);
  });
  it('spring step from 2.6 to target=5 gives value~2.66144', () => {
    const r = springValue(2.6, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.66144, 5);
    expect(r.velocity).toBeCloseTo(3.84, 5);
  });
  it('spring step from 2.7 to target=5 gives value~2.75888', () => {
    const r = springValue(2.7, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.75888, 5);
    expect(r.velocity).toBeCloseTo(3.68, 5);
  });
  it('spring step from 2.8 to target=5 gives value~2.85632', () => {
    const r = springValue(2.8, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.85632, 5);
    expect(r.velocity).toBeCloseTo(3.52, 5);
  });
  it('spring step from 2.9 to target=5 gives value~2.95376', () => {
    const r = springValue(2.9, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(2.95376, 5);
    expect(r.velocity).toBeCloseTo(3.36, 5);
  });
  it('spring step from 3.0 to target=5 gives value~3.0512', () => {
    const r = springValue(3.0, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.0512, 5);
    expect(r.velocity).toBeCloseTo(3.2, 5);
  });
  it('spring step from 3.1 to target=5 gives value~3.14864', () => {
    const r = springValue(3.1, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.14864, 5);
    expect(r.velocity).toBeCloseTo(3.04, 5);
  });
  it('spring step from 3.2 to target=5 gives value~3.24608', () => {
    const r = springValue(3.2, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.24608, 5);
    expect(r.velocity).toBeCloseTo(2.88, 5);
  });
  it('spring step from 3.3 to target=5 gives value~3.34352', () => {
    const r = springValue(3.3, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.34352, 5);
    expect(r.velocity).toBeCloseTo(2.72, 5);
  });
  it('spring step from 3.4 to target=5 gives value~3.44096', () => {
    const r = springValue(3.4, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.44096, 5);
    expect(r.velocity).toBeCloseTo(2.56, 5);
  });
  it('spring step from 3.5 to target=5 gives value~3.5384', () => {
    const r = springValue(3.5, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.5384, 5);
    expect(r.velocity).toBeCloseTo(2.4, 5);
  });
  it('spring step from 3.6 to target=5 gives value~3.63584', () => {
    const r = springValue(3.6, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.63584, 5);
    expect(r.velocity).toBeCloseTo(2.24, 5);
  });
  it('spring step from 3.7 to target=5 gives value~3.73328', () => {
    const r = springValue(3.7, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.73328, 5);
    expect(r.velocity).toBeCloseTo(2.08, 5);
  });
  it('spring step from 3.8 to target=5 gives value~3.83072', () => {
    const r = springValue(3.8, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.83072, 5);
    expect(r.velocity).toBeCloseTo(1.92, 5);
  });
  it('spring step from 3.9 to target=5 gives value~3.92816', () => {
    const r = springValue(3.9, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(3.92816, 5);
    expect(r.velocity).toBeCloseTo(1.76, 5);
  });
  it('spring step from 4.0 to target=5 gives value~4.0256', () => {
    const r = springValue(4.0, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(4.0256, 5);
    expect(r.velocity).toBeCloseTo(1.6, 5);
  });
  it('spring step from 4.1 to target=5 gives value~4.12304', () => {
    const r = springValue(4.1, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(4.12304, 5);
    expect(r.velocity).toBeCloseTo(1.44, 5);
  });
  it('spring step from 4.2 to target=5 gives value~4.22048', () => {
    const r = springValue(4.2, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(4.22048, 5);
    expect(r.velocity).toBeCloseTo(1.28, 5);
  });
  it('spring step from 4.3 to target=5 gives value~4.31792', () => {
    const r = springValue(4.3, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(4.31792, 5);
    expect(r.velocity).toBeCloseTo(1.12, 5);
  });
  it('spring step from 4.4 to target=5 gives value~4.41536', () => {
    const r = springValue(4.4, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(4.41536, 5);
    expect(r.velocity).toBeCloseTo(0.96, 5);
  });
  it('spring step from 4.5 to target=5 gives value~4.5128', () => {
    const r = springValue(4.5, 5, 0, 100, 10, 0.016);
    expect(r.value).toBeCloseTo(4.5128, 5);
    expect(r.velocity).toBeCloseTo(0.8, 5);
  });
});

describe('msToFrames', () => {
  it('msToFrames(0) at 60fps = 0', () => {
    expect(msToFrames(0)).toBeCloseTo(0, 5);
  });
  it('msToFrames(100.0) at 60fps = 6.0', () => {
    expect(msToFrames(100.0)).toBeCloseTo(6.0, 5);
  });
  it('msToFrames(200.0) at 60fps = 12.0', () => {
    expect(msToFrames(200.0)).toBeCloseTo(12.0, 5);
  });
  it('msToFrames(300.0) at 60fps = 18.0', () => {
    expect(msToFrames(300.0)).toBeCloseTo(18.0, 5);
  });
  it('msToFrames(400.0) at 60fps = 24.0', () => {
    expect(msToFrames(400.0)).toBeCloseTo(24.0, 5);
  });
  it('msToFrames(500.0) at 60fps = 30.0', () => {
    expect(msToFrames(500.0)).toBeCloseTo(30.0, 5);
  });
  it('msToFrames(600.0) at 60fps = 36.0', () => {
    expect(msToFrames(600.0)).toBeCloseTo(36.0, 5);
  });
  it('msToFrames(700.0) at 60fps = 42.0', () => {
    expect(msToFrames(700.0)).toBeCloseTo(42.0, 5);
  });
  it('msToFrames(800.0) at 60fps = 48.0', () => {
    expect(msToFrames(800.0)).toBeCloseTo(48.0, 5);
  });
  it('msToFrames(900.0) at 60fps = 54.0', () => {
    expect(msToFrames(900.0)).toBeCloseTo(54.0, 5);
  });
  it('msToFrames(1000.0) at 60fps = 60.0', () => {
    expect(msToFrames(1000.0)).toBeCloseTo(60.0, 5);
  });
  it('msToFrames(1100.0) at 60fps = 66.0', () => {
    expect(msToFrames(1100.0)).toBeCloseTo(66.0, 5);
  });
  it('msToFrames(1200.0) at 60fps = 72.0', () => {
    expect(msToFrames(1200.0)).toBeCloseTo(72.0, 5);
  });
  it('msToFrames(1300.0) at 60fps = 78.0', () => {
    expect(msToFrames(1300.0)).toBeCloseTo(78.0, 5);
  });
  it('msToFrames(1400.0) at 60fps = 84.0', () => {
    expect(msToFrames(1400.0)).toBeCloseTo(84.0, 5);
  });
  it('msToFrames(1500.0) at 60fps = 90.0', () => {
    expect(msToFrames(1500.0)).toBeCloseTo(90.0, 5);
  });
  it('msToFrames(1600.0) at 60fps = 96.0', () => {
    expect(msToFrames(1600.0)).toBeCloseTo(96.0, 5);
  });
  it('msToFrames(1700.0) at 60fps = 102.0', () => {
    expect(msToFrames(1700.0)).toBeCloseTo(102.0, 5);
  });
  it('msToFrames(1800.0) at 60fps = 108.0', () => {
    expect(msToFrames(1800.0)).toBeCloseTo(108.0, 5);
  });
  it('msToFrames(1900.0) at 60fps = 114.0', () => {
    expect(msToFrames(1900.0)).toBeCloseTo(114.0, 5);
  });
  it('msToFrames(2000.0) at 60fps = 120.0', () => {
    expect(msToFrames(2000.0)).toBeCloseTo(120.0, 5);
  });
  it('msToFrames(2100.0) at 60fps = 126.0', () => {
    expect(msToFrames(2100.0)).toBeCloseTo(126.0, 5);
  });
  it('msToFrames(2200.0) at 60fps = 132.0', () => {
    expect(msToFrames(2200.0)).toBeCloseTo(132.0, 5);
  });
  it('msToFrames(2300.0) at 60fps = 138.0', () => {
    expect(msToFrames(2300.0)).toBeCloseTo(138.0, 5);
  });
  it('msToFrames(2400.0) at 60fps = 144.0', () => {
    expect(msToFrames(2400.0)).toBeCloseTo(144.0, 5);
  });
  it('msToFrames(2500.0) at 60fps = 150.0', () => {
    expect(msToFrames(2500.0)).toBeCloseTo(150.0, 5);
  });
  it('msToFrames(2600.0) at 60fps = 156.0', () => {
    expect(msToFrames(2600.0)).toBeCloseTo(156.0, 5);
  });
  it('msToFrames(2700.0) at 60fps = 162.0', () => {
    expect(msToFrames(2700.0)).toBeCloseTo(162.0, 5);
  });
  it('msToFrames(2800.0) at 60fps = 168.0', () => {
    expect(msToFrames(2800.0)).toBeCloseTo(168.0, 5);
  });
  it('msToFrames(2900.0) at 60fps = 174.0', () => {
    expect(msToFrames(2900.0)).toBeCloseTo(174.0, 5);
  });
  it('msToFrames(3000.0) at 60fps = 180.0', () => {
    expect(msToFrames(3000.0)).toBeCloseTo(180.0, 5);
  });
  it('msToFrames(3100.0) at 60fps = 186.0', () => {
    expect(msToFrames(3100.0)).toBeCloseTo(186.0, 5);
  });
  it('msToFrames(3200.0) at 60fps = 192.0', () => {
    expect(msToFrames(3200.0)).toBeCloseTo(192.0, 5);
  });
  it('msToFrames(3300.0) at 60fps = 198.0', () => {
    expect(msToFrames(3300.0)).toBeCloseTo(198.0, 5);
  });
  it('msToFrames(3400.0) at 60fps = 204.0', () => {
    expect(msToFrames(3400.0)).toBeCloseTo(204.0, 5);
  });
  it('msToFrames(3500.0) at 60fps = 210.0', () => {
    expect(msToFrames(3500.0)).toBeCloseTo(210.0, 5);
  });
  it('msToFrames(3600.0) at 60fps = 216.0', () => {
    expect(msToFrames(3600.0)).toBeCloseTo(216.0, 5);
  });
  it('msToFrames(3700.0) at 60fps = 222.0', () => {
    expect(msToFrames(3700.0)).toBeCloseTo(222.0, 5);
  });
  it('msToFrames(3800.0) at 60fps = 228.0', () => {
    expect(msToFrames(3800.0)).toBeCloseTo(228.0, 5);
  });
  it('msToFrames(3900.0) at 60fps = 234.0', () => {
    expect(msToFrames(3900.0)).toBeCloseTo(234.0, 5);
  });
  it('msToFrames(4000.0) at 60fps = 240.0', () => {
    expect(msToFrames(4000.0)).toBeCloseTo(240.0, 5);
  });
  it('msToFrames(4100.0) at 60fps = 246.0', () => {
    expect(msToFrames(4100.0)).toBeCloseTo(246.0, 5);
  });
  it('msToFrames(4200.0) at 60fps = 252.0', () => {
    expect(msToFrames(4200.0)).toBeCloseTo(252.0, 5);
  });
  it('msToFrames(4300.0) at 60fps = 258.0', () => {
    expect(msToFrames(4300.0)).toBeCloseTo(258.0, 5);
  });
  it('msToFrames(4400.0) at 60fps = 264.0', () => {
    expect(msToFrames(4400.0)).toBeCloseTo(264.0, 5);
  });
  it('msToFrames(4500.0) at 60fps = 270.0', () => {
    expect(msToFrames(4500.0)).toBeCloseTo(270.0, 5);
  });
  it('msToFrames(4600.0) at 60fps = 276.0', () => {
    expect(msToFrames(4600.0)).toBeCloseTo(276.0, 5);
  });
  it('msToFrames(4700.0) at 60fps = 282.0', () => {
    expect(msToFrames(4700.0)).toBeCloseTo(282.0, 5);
  });
  it('msToFrames(4800.0) at 60fps = 288.0', () => {
    expect(msToFrames(4800.0)).toBeCloseTo(288.0, 5);
  });
  it('msToFrames(4900.0) at 60fps = 294.0', () => {
    expect(msToFrames(4900.0)).toBeCloseTo(294.0, 5);
  });
  it('msToFrames with custom fps', () => {
    expect(msToFrames(1000, 30)).toBeCloseTo(30, 5);
  });
  it('msToFrames 500ms at 24fps', () => {
    expect(msToFrames(500, 24)).toBeCloseTo(12, 5);
  });
});

describe('framesToMs', () => {
  it('framesToMs(0) at 60fps = 0', () => {
    expect(framesToMs(0)).toBeCloseTo(0, 5);
  });
  it('framesToMs(1) at 60fps = 16.666666666667', () => {
    expect(framesToMs(1)).toBeCloseTo(16.666666666667, 5);
  });
  it('framesToMs(2.0) at 60fps = 33.333333333333', () => {
    expect(framesToMs(2.0)).toBeCloseTo(33.333333333333, 5);
  });
  it('framesToMs(3.0) at 60fps = 50.0', () => {
    expect(framesToMs(3.0)).toBeCloseTo(50.0, 5);
  });
  it('framesToMs(4.0) at 60fps = 66.666666666667', () => {
    expect(framesToMs(4.0)).toBeCloseTo(66.666666666667, 5);
  });
  it('framesToMs(5.0) at 60fps = 83.333333333333', () => {
    expect(framesToMs(5.0)).toBeCloseTo(83.333333333333, 5);
  });
  it('framesToMs(6.0) at 60fps = 100.0', () => {
    expect(framesToMs(6.0)).toBeCloseTo(100.0, 5);
  });
  it('framesToMs(7.0) at 60fps = 116.666666666667', () => {
    expect(framesToMs(7.0)).toBeCloseTo(116.666666666667, 5);
  });
  it('framesToMs(8.0) at 60fps = 133.333333333333', () => {
    expect(framesToMs(8.0)).toBeCloseTo(133.333333333333, 5);
  });
  it('framesToMs(9.0) at 60fps = 150.0', () => {
    expect(framesToMs(9.0)).toBeCloseTo(150.0, 5);
  });
  it('framesToMs(10.0) at 60fps = 166.666666666667', () => {
    expect(framesToMs(10.0)).toBeCloseTo(166.666666666667, 5);
  });
  it('framesToMs(11.0) at 60fps = 183.333333333333', () => {
    expect(framesToMs(11.0)).toBeCloseTo(183.333333333333, 5);
  });
  it('framesToMs(12.0) at 60fps = 200.0', () => {
    expect(framesToMs(12.0)).toBeCloseTo(200.0, 5);
  });
  it('framesToMs(13.0) at 60fps = 216.666666666667', () => {
    expect(framesToMs(13.0)).toBeCloseTo(216.666666666667, 5);
  });
  it('framesToMs(14.0) at 60fps = 233.333333333333', () => {
    expect(framesToMs(14.0)).toBeCloseTo(233.333333333333, 5);
  });
  it('framesToMs(15.0) at 60fps = 250.0', () => {
    expect(framesToMs(15.0)).toBeCloseTo(250.0, 5);
  });
  it('framesToMs(16.0) at 60fps = 266.666666666667', () => {
    expect(framesToMs(16.0)).toBeCloseTo(266.666666666667, 5);
  });
  it('framesToMs(17.0) at 60fps = 283.333333333333', () => {
    expect(framesToMs(17.0)).toBeCloseTo(283.333333333333, 5);
  });
  it('framesToMs(18.0) at 60fps = 300.0', () => {
    expect(framesToMs(18.0)).toBeCloseTo(300.0, 5);
  });
  it('framesToMs(19.0) at 60fps = 316.666666666667', () => {
    expect(framesToMs(19.0)).toBeCloseTo(316.666666666667, 5);
  });
  it('framesToMs(20.0) at 60fps = 333.333333333333', () => {
    expect(framesToMs(20.0)).toBeCloseTo(333.333333333333, 5);
  });
  it('framesToMs(21.0) at 60fps = 350.0', () => {
    expect(framesToMs(21.0)).toBeCloseTo(350.0, 5);
  });
  it('framesToMs(22.0) at 60fps = 366.666666666667', () => {
    expect(framesToMs(22.0)).toBeCloseTo(366.666666666667, 5);
  });
  it('framesToMs(23.0) at 60fps = 383.333333333333', () => {
    expect(framesToMs(23.0)).toBeCloseTo(383.333333333333, 5);
  });
  it('framesToMs(24.0) at 60fps = 400.0', () => {
    expect(framesToMs(24.0)).toBeCloseTo(400.0, 5);
  });
  it('framesToMs(25.0) at 60fps = 416.666666666667', () => {
    expect(framesToMs(25.0)).toBeCloseTo(416.666666666667, 5);
  });
  it('framesToMs(26.0) at 60fps = 433.333333333333', () => {
    expect(framesToMs(26.0)).toBeCloseTo(433.333333333333, 5);
  });
  it('framesToMs(27.0) at 60fps = 450.0', () => {
    expect(framesToMs(27.0)).toBeCloseTo(450.0, 5);
  });
  it('framesToMs(28.0) at 60fps = 466.666666666667', () => {
    expect(framesToMs(28.0)).toBeCloseTo(466.666666666667, 5);
  });
  it('framesToMs(29.0) at 60fps = 483.333333333333', () => {
    expect(framesToMs(29.0)).toBeCloseTo(483.333333333333, 5);
  });
  it('framesToMs(30.0) at 60fps = 500.0', () => {
    expect(framesToMs(30.0)).toBeCloseTo(500.0, 5);
  });
  it('framesToMs(31.0) at 60fps = 516.666666666667', () => {
    expect(framesToMs(31.0)).toBeCloseTo(516.666666666667, 5);
  });
  it('framesToMs(32.0) at 60fps = 533.333333333333', () => {
    expect(framesToMs(32.0)).toBeCloseTo(533.333333333333, 5);
  });
  it('framesToMs(33.0) at 60fps = 550.0', () => {
    expect(framesToMs(33.0)).toBeCloseTo(550.0, 5);
  });
  it('framesToMs(34.0) at 60fps = 566.666666666667', () => {
    expect(framesToMs(34.0)).toBeCloseTo(566.666666666667, 5);
  });
  it('framesToMs(35.0) at 60fps = 583.333333333333', () => {
    expect(framesToMs(35.0)).toBeCloseTo(583.333333333333, 5);
  });
  it('framesToMs(36.0) at 60fps = 600.0', () => {
    expect(framesToMs(36.0)).toBeCloseTo(600.0, 5);
  });
  it('framesToMs(37.0) at 60fps = 616.666666666667', () => {
    expect(framesToMs(37.0)).toBeCloseTo(616.666666666667, 5);
  });
  it('framesToMs(38.0) at 60fps = 633.333333333333', () => {
    expect(framesToMs(38.0)).toBeCloseTo(633.333333333333, 5);
  });
  it('framesToMs(39.0) at 60fps = 650.0', () => {
    expect(framesToMs(39.0)).toBeCloseTo(650.0, 5);
  });
  it('framesToMs(40.0) at 60fps = 666.666666666667', () => {
    expect(framesToMs(40.0)).toBeCloseTo(666.666666666667, 5);
  });
  it('framesToMs(41.0) at 60fps = 683.333333333333', () => {
    expect(framesToMs(41.0)).toBeCloseTo(683.333333333333, 5);
  });
  it('framesToMs(42.0) at 60fps = 700.0', () => {
    expect(framesToMs(42.0)).toBeCloseTo(700.0, 5);
  });
  it('framesToMs(43.0) at 60fps = 716.666666666667', () => {
    expect(framesToMs(43.0)).toBeCloseTo(716.666666666667, 5);
  });
  it('framesToMs(44.0) at 60fps = 733.333333333333', () => {
    expect(framesToMs(44.0)).toBeCloseTo(733.333333333333, 5);
  });
  it('framesToMs(45.0) at 60fps = 750.0', () => {
    expect(framesToMs(45.0)).toBeCloseTo(750.0, 5);
  });
  it('framesToMs(46.0) at 60fps = 766.666666666667', () => {
    expect(framesToMs(46.0)).toBeCloseTo(766.666666666667, 5);
  });
  it('framesToMs(47.0) at 60fps = 783.333333333333', () => {
    expect(framesToMs(47.0)).toBeCloseTo(783.333333333333, 5);
  });
  it('framesToMs(48.0) at 60fps = 800.0', () => {
    expect(framesToMs(48.0)).toBeCloseTo(800.0, 5);
  });
  it('framesToMs(49.0) at 60fps = 816.666666666667', () => {
    expect(framesToMs(49.0)).toBeCloseTo(816.666666666667, 5);
  });
  it('framesToMs with custom fps', () => {
    expect(framesToMs(30, 30)).toBeCloseTo(1000, 5);
  });
  it('framesToMs 24 frames at 24fps = 1000ms', () => {
    expect(framesToMs(24, 24)).toBeCloseTo(1000, 5);
  });
});

describe('secondsToMs', () => {
  it('secondsToMs(0) = 0', () => {
    expect(secondsToMs(0)).toBeCloseTo(0, 5);
  });
  it('secondsToMs(0.1) = 100.0', () => {
    expect(secondsToMs(0.1)).toBeCloseTo(100.0, 5);
  });
  it('secondsToMs(0.2) = 200.0', () => {
    expect(secondsToMs(0.2)).toBeCloseTo(200.0, 5);
  });
  it('secondsToMs(0.3) = 300.0', () => {
    expect(secondsToMs(0.3)).toBeCloseTo(300.0, 5);
  });
  it('secondsToMs(0.4) = 400.0', () => {
    expect(secondsToMs(0.4)).toBeCloseTo(400.0, 5);
  });
  it('secondsToMs(0.5) = 500.0', () => {
    expect(secondsToMs(0.5)).toBeCloseTo(500.0, 5);
  });
  it('secondsToMs(0.6) = 600.0', () => {
    expect(secondsToMs(0.6)).toBeCloseTo(600.0, 5);
  });
  it('secondsToMs(0.7) = 700.0', () => {
    expect(secondsToMs(0.7)).toBeCloseTo(700.0, 5);
  });
  it('secondsToMs(0.8) = 800.0', () => {
    expect(secondsToMs(0.8)).toBeCloseTo(800.0, 5);
  });
  it('secondsToMs(0.9) = 900.0', () => {
    expect(secondsToMs(0.9)).toBeCloseTo(900.0, 5);
  });
  it('secondsToMs(1) = 1000.0', () => {
    expect(secondsToMs(1)).toBeCloseTo(1000.0, 5);
  });
  it('secondsToMs(1.1) = 1100.0', () => {
    expect(secondsToMs(1.1)).toBeCloseTo(1100.0, 5);
  });
  it('secondsToMs(1.2) = 1200.0', () => {
    expect(secondsToMs(1.2)).toBeCloseTo(1200.0, 5);
  });
  it('secondsToMs(1.3) = 1300.0', () => {
    expect(secondsToMs(1.3)).toBeCloseTo(1300.0, 5);
  });
  it('secondsToMs(1.4) = 1400.0', () => {
    expect(secondsToMs(1.4)).toBeCloseTo(1400.0, 5);
  });
  it('secondsToMs(1.5) = 1500.0', () => {
    expect(secondsToMs(1.5)).toBeCloseTo(1500.0, 5);
  });
  it('secondsToMs(1.6) = 1600.0', () => {
    expect(secondsToMs(1.6)).toBeCloseTo(1600.0, 5);
  });
  it('secondsToMs(1.7) = 1700.0', () => {
    expect(secondsToMs(1.7)).toBeCloseTo(1700.0, 5);
  });
  it('secondsToMs(1.8) = 1800.0', () => {
    expect(secondsToMs(1.8)).toBeCloseTo(1800.0, 5);
  });
  it('secondsToMs(1.9) = 1900.0', () => {
    expect(secondsToMs(1.9)).toBeCloseTo(1900.0, 5);
  });
  it('secondsToMs(2.0) = 2000.0', () => {
    expect(secondsToMs(2.0)).toBeCloseTo(2000.0, 5);
  });
  it('secondsToMs(2.1) = 2100.0', () => {
    expect(secondsToMs(2.1)).toBeCloseTo(2100.0, 5);
  });
  it('secondsToMs(2.2) = 2200.0', () => {
    expect(secondsToMs(2.2)).toBeCloseTo(2200.0, 5);
  });
  it('secondsToMs(2.3) = 2300.0', () => {
    expect(secondsToMs(2.3)).toBeCloseTo(2300.0, 5);
  });
  it('secondsToMs(2.4) = 2400.0', () => {
    expect(secondsToMs(2.4)).toBeCloseTo(2400.0, 5);
  });
  it('secondsToMs(2.5) = 2500.0', () => {
    expect(secondsToMs(2.5)).toBeCloseTo(2500.0, 5);
  });
  it('secondsToMs(2.6) = 2600.0', () => {
    expect(secondsToMs(2.6)).toBeCloseTo(2600.0, 5);
  });
  it('secondsToMs(2.7) = 2700.0', () => {
    expect(secondsToMs(2.7)).toBeCloseTo(2700.0, 5);
  });
  it('secondsToMs(2.8) = 2800.0', () => {
    expect(secondsToMs(2.8)).toBeCloseTo(2800.0, 5);
  });
  it('secondsToMs(2.9) = 2900.0', () => {
    expect(secondsToMs(2.9)).toBeCloseTo(2900.0, 5);
  });
  it('secondsToMs(3.0) = 3000.0', () => {
    expect(secondsToMs(3.0)).toBeCloseTo(3000.0, 5);
  });
  it('secondsToMs(3.1) = 3100.0', () => {
    expect(secondsToMs(3.1)).toBeCloseTo(3100.0, 5);
  });
  it('secondsToMs(3.2) = 3200.0', () => {
    expect(secondsToMs(3.2)).toBeCloseTo(3200.0, 5);
  });
  it('secondsToMs(3.3) = 3300.0', () => {
    expect(secondsToMs(3.3)).toBeCloseTo(3300.0, 5);
  });
  it('secondsToMs(3.4) = 3400.0', () => {
    expect(secondsToMs(3.4)).toBeCloseTo(3400.0, 5);
  });
  it('secondsToMs(3.5) = 3500.0', () => {
    expect(secondsToMs(3.5)).toBeCloseTo(3500.0, 5);
  });
  it('secondsToMs(3.6) = 3600.0', () => {
    expect(secondsToMs(3.6)).toBeCloseTo(3600.0, 5);
  });
  it('secondsToMs(3.7) = 3700.0', () => {
    expect(secondsToMs(3.7)).toBeCloseTo(3700.0, 5);
  });
  it('secondsToMs(3.8) = 3800.0', () => {
    expect(secondsToMs(3.8)).toBeCloseTo(3800.0, 5);
  });
  it('secondsToMs(3.9) = 3900.0', () => {
    expect(secondsToMs(3.9)).toBeCloseTo(3900.0, 5);
  });
  it('secondsToMs(4.0) = 4000.0', () => {
    expect(secondsToMs(4.0)).toBeCloseTo(4000.0, 5);
  });
  it('secondsToMs(4.1) = 4100.000000000001', () => {
    expect(secondsToMs(4.1)).toBeCloseTo(4100.000000000001, 5);
  });
  it('secondsToMs(4.2) = 4200.0', () => {
    expect(secondsToMs(4.2)).toBeCloseTo(4200.0, 5);
  });
  it('secondsToMs(4.3) = 4300.0', () => {
    expect(secondsToMs(4.3)).toBeCloseTo(4300.0, 5);
  });
  it('secondsToMs(4.4) = 4400.0', () => {
    expect(secondsToMs(4.4)).toBeCloseTo(4400.0, 5);
  });
  it('secondsToMs(4.5) = 4500.0', () => {
    expect(secondsToMs(4.5)).toBeCloseTo(4500.0, 5);
  });
  it('secondsToMs(4.6) = 4600.000000000001', () => {
    expect(secondsToMs(4.6)).toBeCloseTo(4600.000000000001, 5);
  });
  it('secondsToMs(4.7) = 4700.0', () => {
    expect(secondsToMs(4.7)).toBeCloseTo(4700.0, 5);
  });
  it('secondsToMs(4.8) = 4800.000000000001', () => {
    expect(secondsToMs(4.8)).toBeCloseTo(4800.000000000001, 5);
  });
  it('secondsToMs(4.9) = 4900.0', () => {
    expect(secondsToMs(4.9)).toBeCloseTo(4900.0, 5);
  });
});

describe('msToSeconds', () => {
  it('msToSeconds(0) = 0', () => {
    expect(msToSeconds(0)).toBeCloseTo(0, 5);
  });
  it('msToSeconds(100.0) = 0.1', () => {
    expect(msToSeconds(100.0)).toBeCloseTo(0.1, 5);
  });
  it('msToSeconds(200.0) = 0.2', () => {
    expect(msToSeconds(200.0)).toBeCloseTo(0.2, 5);
  });
  it('msToSeconds(300.0) = 0.3', () => {
    expect(msToSeconds(300.0)).toBeCloseTo(0.3, 5);
  });
  it('msToSeconds(400.0) = 0.4', () => {
    expect(msToSeconds(400.0)).toBeCloseTo(0.4, 5);
  });
  it('msToSeconds(500.0) = 0.5', () => {
    expect(msToSeconds(500.0)).toBeCloseTo(0.5, 5);
  });
  it('msToSeconds(600.0) = 0.6', () => {
    expect(msToSeconds(600.0)).toBeCloseTo(0.6, 5);
  });
  it('msToSeconds(700.0) = 0.7', () => {
    expect(msToSeconds(700.0)).toBeCloseTo(0.7, 5);
  });
  it('msToSeconds(800.0) = 0.8', () => {
    expect(msToSeconds(800.0)).toBeCloseTo(0.8, 5);
  });
  it('msToSeconds(900.0) = 0.9', () => {
    expect(msToSeconds(900.0)).toBeCloseTo(0.9, 5);
  });
  it('msToSeconds(1000.0) = 1', () => {
    expect(msToSeconds(1000.0)).toBeCloseTo(1, 5);
  });
  it('msToSeconds(1100.0) = 1.1', () => {
    expect(msToSeconds(1100.0)).toBeCloseTo(1.1, 5);
  });
  it('msToSeconds(1200.0) = 1.2', () => {
    expect(msToSeconds(1200.0)).toBeCloseTo(1.2, 5);
  });
  it('msToSeconds(1300.0) = 1.3', () => {
    expect(msToSeconds(1300.0)).toBeCloseTo(1.3, 5);
  });
  it('msToSeconds(1400.0) = 1.4', () => {
    expect(msToSeconds(1400.0)).toBeCloseTo(1.4, 5);
  });
  it('msToSeconds(1500.0) = 1.5', () => {
    expect(msToSeconds(1500.0)).toBeCloseTo(1.5, 5);
  });
  it('msToSeconds(1600.0) = 1.6', () => {
    expect(msToSeconds(1600.0)).toBeCloseTo(1.6, 5);
  });
  it('msToSeconds(1700.0) = 1.7', () => {
    expect(msToSeconds(1700.0)).toBeCloseTo(1.7, 5);
  });
  it('msToSeconds(1800.0) = 1.8', () => {
    expect(msToSeconds(1800.0)).toBeCloseTo(1.8, 5);
  });
  it('msToSeconds(1900.0) = 1.9', () => {
    expect(msToSeconds(1900.0)).toBeCloseTo(1.9, 5);
  });
  it('msToSeconds(2000.0) = 2.0', () => {
    expect(msToSeconds(2000.0)).toBeCloseTo(2.0, 5);
  });
  it('msToSeconds(2100.0) = 2.1', () => {
    expect(msToSeconds(2100.0)).toBeCloseTo(2.1, 5);
  });
  it('msToSeconds(2200.0) = 2.2', () => {
    expect(msToSeconds(2200.0)).toBeCloseTo(2.2, 5);
  });
  it('msToSeconds(2300.0) = 2.3', () => {
    expect(msToSeconds(2300.0)).toBeCloseTo(2.3, 5);
  });
  it('msToSeconds(2400.0) = 2.4', () => {
    expect(msToSeconds(2400.0)).toBeCloseTo(2.4, 5);
  });
  it('msToSeconds(2500.0) = 2.5', () => {
    expect(msToSeconds(2500.0)).toBeCloseTo(2.5, 5);
  });
  it('msToSeconds(2600.0) = 2.6', () => {
    expect(msToSeconds(2600.0)).toBeCloseTo(2.6, 5);
  });
  it('msToSeconds(2700.0) = 2.7', () => {
    expect(msToSeconds(2700.0)).toBeCloseTo(2.7, 5);
  });
  it('msToSeconds(2800.0) = 2.8', () => {
    expect(msToSeconds(2800.0)).toBeCloseTo(2.8, 5);
  });
  it('msToSeconds(2900.0) = 2.9', () => {
    expect(msToSeconds(2900.0)).toBeCloseTo(2.9, 5);
  });
  it('msToSeconds(3000.0) = 3.0', () => {
    expect(msToSeconds(3000.0)).toBeCloseTo(3.0, 5);
  });
  it('msToSeconds(3100.0) = 3.1', () => {
    expect(msToSeconds(3100.0)).toBeCloseTo(3.1, 5);
  });
  it('msToSeconds(3200.0) = 3.2', () => {
    expect(msToSeconds(3200.0)).toBeCloseTo(3.2, 5);
  });
  it('msToSeconds(3300.0) = 3.3', () => {
    expect(msToSeconds(3300.0)).toBeCloseTo(3.3, 5);
  });
  it('msToSeconds(3400.0) = 3.4', () => {
    expect(msToSeconds(3400.0)).toBeCloseTo(3.4, 5);
  });
  it('msToSeconds(3500.0) = 3.5', () => {
    expect(msToSeconds(3500.0)).toBeCloseTo(3.5, 5);
  });
  it('msToSeconds(3600.0) = 3.6', () => {
    expect(msToSeconds(3600.0)).toBeCloseTo(3.6, 5);
  });
  it('msToSeconds(3700.0) = 3.7', () => {
    expect(msToSeconds(3700.0)).toBeCloseTo(3.7, 5);
  });
  it('msToSeconds(3800.0) = 3.8', () => {
    expect(msToSeconds(3800.0)).toBeCloseTo(3.8, 5);
  });
  it('msToSeconds(3900.0) = 3.9', () => {
    expect(msToSeconds(3900.0)).toBeCloseTo(3.9, 5);
  });
  it('msToSeconds(4000.0) = 4.0', () => {
    expect(msToSeconds(4000.0)).toBeCloseTo(4.0, 5);
  });
  it('msToSeconds(4100.0) = 4.1', () => {
    expect(msToSeconds(4100.0)).toBeCloseTo(4.1, 5);
  });
  it('msToSeconds(4200.0) = 4.2', () => {
    expect(msToSeconds(4200.0)).toBeCloseTo(4.2, 5);
  });
  it('msToSeconds(4300.0) = 4.3', () => {
    expect(msToSeconds(4300.0)).toBeCloseTo(4.3, 5);
  });
  it('msToSeconds(4400.0) = 4.4', () => {
    expect(msToSeconds(4400.0)).toBeCloseTo(4.4, 5);
  });
  it('msToSeconds(4500.0) = 4.5', () => {
    expect(msToSeconds(4500.0)).toBeCloseTo(4.5, 5);
  });
  it('msToSeconds(4600.0) = 4.6', () => {
    expect(msToSeconds(4600.0)).toBeCloseTo(4.6, 5);
  });
  it('msToSeconds(4700.0) = 4.7', () => {
    expect(msToSeconds(4700.0)).toBeCloseTo(4.7, 5);
  });
  it('msToSeconds(4800.0) = 4.8', () => {
    expect(msToSeconds(4800.0)).toBeCloseTo(4.8, 5);
  });
  it('msToSeconds(4900.0) = 4.9', () => {
    expect(msToSeconds(4900.0)).toBeCloseTo(4.9, 5);
  });
});
