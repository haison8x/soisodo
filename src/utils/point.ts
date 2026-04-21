import proj4 from 'proj4';
import type { Coordinate, WGS84Point, MapData } from '../types';

/************* Proj4 ******************/
const proj4Dict: Record<string, string> = {};
proj4Dict['EPSG:_An-Giang'] =
  '+proj=tmerc +lat_0=0 +lon_0=104.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bà-Rịa-Vũng-Tàu'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bắc-Cạn'] =
  '+proj=tmerc +lat_0=0 +lon_0=106.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bắc-Giang'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bạc-Liêu'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bắc-Ninh'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bến-Tre'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bình-Định'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.250 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bình-Dương'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bình-Phước'] =
  '+proj=tmerc +lat_0=0 +lon_0=106.250 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Bình-Thuận'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Cà-Mau'] =
  '+proj=tmerc +lat_0=0 +lon_0=104.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Cao-Bằng'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Đắc-Nông'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Đắk-Lắk'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Điện-Biên'] =
  '+proj=tmerc +lat_0=0 +lon_0=103.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Đồng-Nai'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Đồng-Tháp'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Gia-Lai'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Hà-Giang'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Hà-Nam'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Hà-Tĩnh'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Hải-Dương'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Hậu-Giang'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Hoà-Bình'] =
  '+proj=tmerc +lat_0=0 +lon_0=106.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Hưng-Yên'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Khánh-Hoà'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.250 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Kiên-Giang'] =
  '+proj=tmerc +lat_0=0 +lon_0=104.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Kon-Tum'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Lai-Châu'] =
  '+proj=tmerc +lat_0=0 +lon_0=103.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Lâm-Đồng'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Lạng-Sơn'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.250 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Lào-Cai'] =
  '+proj=tmerc +lat_0=0 +lon_0=104.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Long-An'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Nam-Định'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Nghệ-An'] =
  '+proj=tmerc +lat_0=0 +lon_0=104.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Ninh-Bình'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Ninh-Thuận'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.250 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Phú-Thọ'] =
  '+proj=tmerc +lat_0=0 +lon_0=104.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Phú-Yên'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Quảng-Bình'] =
  '+proj=tmerc +lat_0=0 +lon_0=106.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Quảng-Nam'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Quảng-Ngãi'] =
  '+proj=tmerc +lat_0=0 +lon_0=108.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Quảng-Ninh'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Quảng-Trị'] =
  '+proj=tmerc +lat_0=0 +lon_0=106.250 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Sóc-Trăng'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Sơn-La'] =
  '+proj=tmerc +lat_0=0 +lon_0=104.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Tây-Ninh'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Thái-Bình'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Thái-Nguyên'] =
  '+proj=tmerc +lat_0=0 +lon_0=106.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Thanh-Hoá'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Thừa-Thiên-Huế'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Tiền-Giang'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_TP-Cần-Thơ'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_TP-Đà-Nẵng'] =
  '+proj=tmerc +lat_0=0 +lon_0=107.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_TP-Hà-Nội'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_TP.-Hải-Phòng'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_TP-Hồ-Chí-Minh'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Trà-Vinh'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Tuyên-Quang'] =
  '+proj=tmerc +lat_0=0 +lon_0=106.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Vĩnh-Long'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.500 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Vĩnh-Phúc'] =
  '+proj=tmerc +lat_0=0 +lon_0=105.000 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';
proj4Dict['EPSG:_Yên-Bái'] =
  '+proj=tmerc +lat_0=0 +lon_0=104.750 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';

export { proj4Dict };

export function convertVN2000ToWGS84(
  x: string,
  y: string,
  province: string,
): WGS84Point | null {
  if (!province || !proj4Dict[province]) {
    return null;
  }
  try {
    const projection = proj4Dict[province];
    const point = proj4(projection, 'WGS84', { y: parseFloat(x), x: parseFloat(y) });
    return { latitude: point.y, longitude: point.x };
  } catch (error) {
    console.error('Conversion error:', error);
    return null;
  }
}

export function toMapPoints(
  name: string,
  province: string,
  points: Coordinate[],
): MapData {
  const projection = proj4Dict[province];
  let wgs84Points: WGS84Point[] = points.map(p =>
    proj4(projection, 'WGS84', { y: parseFloat(p.x), x: parseFloat(p.y) }),
  );

  wgs84Points = wgs84Points.map(p => ({
    longitude: (p as unknown as { x: number }).x,
    latitude: (p as unknown as { y: number }).y,
  }));

  return { points, wgs84Points, name, province };
}

export function isValidPoints(points: Coordinate[]): boolean {
  return points.every(point => Number(point.x) > 0 && Number(point.y) > 0);
}
/************* Proj4 ******************/
