import React from 'react';
import { Image } from 'react-native';

import { MetricKey } from '../../components/physioeye/types';
import { MetricVisualConfig } from './metricDetail.types';
import { physioIcons } from '../../components/physioeye/physioIcons';

const metricIconStyle = {
  width: 100,
  height: 100,
};

const categoryIconStyle = {
  width: 100,
  height: 100,
};

const renderCategoryIcon = (source: any) => (
  <Image source={source} style={categoryIconStyle} resizeMode="contain" />
);

const renderMetricIcon = (source: any) => (
  <Image source={source} style={metricIconStyle} resizeMode="contain" />
);

export const METRIC_CONFIG: Record<MetricKey, MetricVisualConfig> = {
  posture: {
    title: 'Posture',
    subtitle: 'How your head, shoulders and spine\nare positioned',
    icon: renderCategoryIcon(physioIcons.posture),
    metrics: [
      {
        key: 'head',
        title: 'Head Position',
        icon: renderMetricIcon(physioIcons.headPosition),
      },
      {
        key: 'shoulder',
        title: 'Shoulder Position',
        icon: renderMetricIcon(physioIcons.shoulder),
      },
      {
        key: 'upper_back',
        title: 'Upper-Back Posture',
        icon: renderMetricIcon(physioIcons.upperBack),
      },
      {
        key: 'lower_back',
        title: 'Lower-Back Posture',
        icon: renderMetricIcon(physioIcons.lowerBack),
      },
    ],
  },

  alignment: {
    title: 'Alignment',
    subtitle: 'How your body segments are\naligned with each other',
    icon: renderCategoryIcon(physioIcons.postureAlignment),
    metrics: [
      {
        key: 'pelvic',
        title: 'Pelvic Alignment',
        icon: renderMetricIcon(physioIcons.pelvicAlignment),
      },
      {
        key: 'shoulder',
        title: 'Shoulder Alignment',
        icon: renderMetricIcon(physioIcons.shoulderAlignment),
      },
      {
        key: 'knee',
        title: 'Knee Alignment',
        icon: renderMetricIcon(physioIcons.kneeAlignment),
      },
    ],
  },

  upperBody: {
    title: 'Upper Body',
    subtitle: 'How your upper body moves\nand performs',
    icon: renderCategoryIcon(physioIcons.upperBody),
    metrics: [
      {
        key: 'shoulder',
        title: 'Shoulder Mobility',
        icon: renderMetricIcon(physioIcons.shoulderRom),
      },
      {
        key: 'elbow',
        title: 'Elbow Mobility',
        icon: renderMetricIcon(physioIcons.elbowRom),
      },
      {
        key: 'wrist',
        title: 'Wrist Mobility',
        icon: renderMetricIcon(physioIcons.wristRom),
      },
    ],
  },

  lowerBody: {
    title: 'Lower Body',
    subtitle: 'How your hips, knees and ankles\nmove and perform',
    icon: renderCategoryIcon(physioIcons.lowerBody),
    metrics: [
      {
        key: 'hip',
        title: 'Hip Mobility',
        icon: renderMetricIcon(physioIcons.hipRom),
      },
      {
        key: 'ankle',
        title: 'Ankle Mobility',
        icon: renderMetricIcon(physioIcons.ankleRom),
      },
      {
        key: 'knee',
        title: 'Knee Mobility',
        icon: renderMetricIcon(physioIcons.kneeRom),
      },
    ],
  },

  functional: {
    title: 'Functional Movement',
    subtitle: 'How you perform everyday\nfunctional movements',
    icon: renderCategoryIcon(physioIcons.functionalMovement),
    metrics: [
      {
        key: 'reach_balance',
        title: 'Reach & Balance',
        icon: renderMetricIcon(physioIcons.reach),
      },
      {
        key: 'flexibility',
        title: 'Flexibility',
        icon: renderMetricIcon(physioIcons.flexibility),
      },
      {
        key: 'movement_control',
        title: 'Movement Control',
        icon: renderMetricIcon(physioIcons.movementControl),
      },
    ],
  },

  walking: {
    title: 'Walking',
    subtitle: 'How you walk, move and\nmaintain your gait',
    icon: renderCategoryIcon(physioIcons.walking),
    metrics: [
      {
        key: 'walking_symmetry',
        title: 'Walking Symmetry',
        icon: renderMetricIcon(physioIcons.walkingSymmetry),
      },
      {
        key: 'step_consistency',
        title: 'Step Consistency',
        icon: renderMetricIcon(physioIcons.step),
      },
      {
        key: 'fall_risk',
        title: 'Fall Risk',
        icon: renderMetricIcon(physioIcons.fall),
      },
    ],
  },
};
