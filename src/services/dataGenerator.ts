/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationParameters, StationInfo, WaterQualityDataPoint } from '../types/waterQuality';
import { STATIONS } from '../constants/thresholds';

/**
 * Creates the initial baseline history of water quality data points.
 */
export function generateInitialHistory(
  station: StationInfo,
  count = 30,
  intervalSeconds = 5
): WaterQualityDataPoint[] {
  const points: WaterQualityDataPoint[] = [];
  const now = Date.now();

  let nitrate = station.baselineNitrate;
  let phosphate = station.baselinePhosphate;
  let dissolvedOxygen = station.baselineDO;
  let turbidity = 4.2;
  let waterTemperature = 19.5;
  let pH = 7.35;
  let rainfall = 0.0;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalSeconds * 1000).toISOString();

    // Minor random walk around baseline
    nitrate = Math.max(0.2, nitrate + (Math.random() - 0.49) * 0.12);
    phosphate = Math.max(0.01, phosphate + (Math.random() - 0.49) * 0.008);
    dissolvedOxygen = Math.min(13.0, Math.max(3.0, dissolvedOxygen + (Math.random() - 0.5) * 0.08));
    turbidity = Math.max(1.0, turbidity + (Math.random() - 0.5) * 0.3);
    waterTemperature = Math.max(10, Math.min(30, waterTemperature + (Math.random() - 0.5) * 0.05));
    pH = Math.max(6.5, Math.min(8.8, pH + (Math.random() - 0.5) * 0.02));
    rainfall = Math.max(0, rainfall + (Math.random() - 0.5) * 0.2);

    points.push({
      timestamp,
      stationId: station.id,
      stationName: station.name,
      dataType: 'SIMULATED',
      nitrateMgL: Number(nitrate.toFixed(2)),
      phosphateMgL: Number(phosphate.toFixed(3)),
      dissolvedOxygenMgL: Number(dissolvedOxygen.toFixed(2)),
      turbidityNTU: Number(turbidity.toFixed(1)),
      waterTemperatureC: Number(waterTemperature.toFixed(1)),
      pH: Number(pH.toFixed(2)),
      rainfallMmPerHour: Number(rainfall.toFixed(1)),
    });
  }

  return points;
}

/**
 * Generates the next simulated point based on the last point and current simulation parameters.
 */
export function generateNextPoint(
  previousPoint: WaterQualityDataPoint,
  station: StationInfo,
  simParams: SimulationParameters
): WaterQualityDataPoint {
  const { rainfallMmPerHour, fertilizerIntensity, vegetatedBufferActive, smartFertilizerActive } = simParams;

  // Fertilizer modifier: low=0.6, normal=1.0, high=1.8
  const fertilizerFactor = fertilizerIntensity === 'high' ? 1.8 : fertilizerIntensity === 'low' ? 0.6 : 1.0;
  
  // Mitigation buffer factor: buffer cuts runoff impact by ~40%, smart fertilizer cuts by ~30%
  let mitigationMultiplier = 1.0;
  if (vegetatedBufferActive) mitigationMultiplier *= 0.6;
  if (smartFertilizerActive) mitigationMultiplier *= 0.7;

  // Runoff force driven by rainfall:
  const runoffForce = (rainfallMmPerHour / 20) * fertilizerFactor * mitigationMultiplier;

  // Natural drift toward target equilibrium
  const targetNitrate = station.baselineNitrate + runoffForce * 3.5;
  const targetPhosphate = station.baselinePhosphate + runoffForce * 0.22;
  const targetTurbidity = 3.5 + (rainfallMmPerHour * 0.7) * (vegetatedBufferActive ? 0.45 : 1.0);
  
  // Dissolved oxygen reacts inversely to elevated nutrients & turbidity over time
  const nutrientStress = Math.max(0, (targetNitrate - 3.0) * 0.25 + (targetPhosphate - 0.1) * 3.0);
  const targetDO = Math.max(3.2, station.baselineDO - nutrientStress - (runoffForce > 0.8 ? 0.8 : 0));

  // Step toward targets smoothly (smooth relaxation)
  const smoothing = 0.15;
  const noise = (Math.random() - 0.5);

  const nextNitrate = Math.max(0.1, previousPoint.nitrateMgL + (targetNitrate - previousPoint.nitrateMgL) * smoothing + noise * 0.1);
  const nextPhosphate = Math.max(0.005, previousPoint.phosphateMgL + (targetPhosphate - previousPoint.phosphateMgL) * smoothing + noise * 0.008);
  const nextDO = Math.min(14.0, Math.max(2.5, previousPoint.dissolvedOxygenMgL + (targetDO - previousPoint.dissolvedOxygenMgL) * smoothing + noise * 0.06));
  const nextTurbidity = Math.max(0.8, previousPoint.turbidityNTU + (targetTurbidity - previousPoint.turbidityNTU) * smoothing + noise * 0.35);

  // Slight diurnal water temp variation
  const nextTemp = Math.max(12.0, Math.min(29.0, previousPoint.waterTemperatureC + (Math.random() - 0.48) * 0.08));

  // pH slightly rises if excessive algae growth or buffers
  const nextPH = Math.max(6.8, Math.min(8.6, previousPoint.pH + (targetPhosphate > 0.2 ? 0.02 : -0.01) + noise * 0.02));

  return {
    timestamp: new Date().toISOString(),
    stationId: station.id,
    stationName: station.name,
    dataType: 'SIMULATED',
    nitrateMgL: Number(nextNitrate.toFixed(2)),
    phosphateMgL: Number(nextPhosphate.toFixed(3)),
    dissolvedOxygenMgL: Number(nextDO.toFixed(2)),
    turbidityNTU: Number(nextTurbidity.toFixed(1)),
    waterTemperatureC: Number(nextTemp.toFixed(1)),
    pH: Number(nextPH.toFixed(2)),
    rainfallMmPerHour: Number(rainfallMmPerHour.toFixed(1)),
  };
}

/**
 * Predicts / projects comparative scenario trajectory for 12 forward steps.
 */
export function projectScenarioCurve(
  baselineStation: StationInfo,
  simParams: SimulationParameters,
  steps = 12
) {
  const result: Array<{
    step: number;
    timeLabel: string;
    baselineNitrate: number;
    simulatedNitrate: number;
    baselinePhosphate: number;
    simulatedPhosphate: number;
    simulatedDO: number;
    simulatedTurbidity: number;
  }> = [];

  let simN = baselineStation.baselineNitrate;
  let simP = baselineStation.baselinePhosphate;
  let simDO = baselineStation.baselineDO;

  const fertilizerFactor = simParams.fertilizerIntensity === 'high' ? 1.9 : simParams.fertilizerIntensity === 'low' ? 0.6 : 1.0;
  let mitigation = 1.0;
  if (simParams.vegetatedBufferActive) mitigation *= 0.55;
  if (simParams.smartFertilizerActive) mitigation *= 0.65;

  const rainImpact = (simParams.rainfallMmPerHour / 25) * fertilizerFactor * mitigation;

  for (let s = 1; s <= steps; s++) {
    // Peak runoff curve peaks at step 4-5
    const stormCurve = Math.exp(-Math.pow(s - 4.5, 2) / 6);
    const addedN = rainImpact * 5.0 * stormCurve;
    const addedP = rainImpact * 0.35 * stormCurve;

    const currentN = Number((baselineStation.baselineNitrate + addedN).toFixed(2));
    const currentP = Number((baselineStation.baselinePhosphate + addedP).toFixed(3));
    const currentDO = Number(Math.max(3.5, baselineStation.baselineDO - (addedN * 0.35 + addedP * 2.5)).toFixed(2));
    const currentTurb = Number((4.0 + simParams.rainfallMmPerHour * 0.6 * (simParams.vegetatedBufferActive ? 0.4 : 1.0) * stormCurve).toFixed(1));

    result.push({
      step: s,
      timeLabel: `+${s * 15}분`,
      baselineNitrate: baselineStation.baselineNitrate,
      simulatedNitrate: currentN,
      baselinePhosphate: baselineStation.baselinePhosphate,
      simulatedPhosphate: currentP,
      simulatedDO: currentDO,
      simulatedTurbidity: currentTurb,
    });
  }

  return result;
}
