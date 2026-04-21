export interface City {
  label: string;
  value: string;
}

export interface Coordinate {
  id: string;
  x: string;
  y: string;
}

export interface WGS84Point {
  latitude: number;
  longitude: number;
}

export interface MapData {
  points: Coordinate[];
  wgs84Points: WGS84Point[];
  name: string;
  province: string;
}

export interface Project {
  id: string;
  title: string;
  city: string;
  cityValue: string;
  coordinates: Coordinate[];
  address: string;
  createdAt: string;
  updatedAt: string;
}
