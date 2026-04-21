import type { NavigatorScreenParams } from '@react-navigation/native';
import type { MapData, Project } from './index';

export type HomeStackParamList = {
  HomeMain: { projectData?: Project } | undefined;
  Map: { mapData: MapData };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  UserManual: undefined;
  AppInfo: undefined;
  Terms: undefined;
  Privacy: undefined;
};

export type VN2000StackParamList = {
  VN2000Main: undefined;
  ConvertGoogle: { latitude: number; longitude: number };
};

export type TabParamList = {
  'Trang chủ': NavigatorScreenParams<HomeStackParamList> | undefined;
  VN2000: NavigatorScreenParams<VN2000StackParamList> | undefined;
  'Sổ đỏ': undefined;
  'Quy hoạch': undefined;
  'Cài đặt': NavigatorScreenParams<SettingsStackParamList> | undefined;
};
