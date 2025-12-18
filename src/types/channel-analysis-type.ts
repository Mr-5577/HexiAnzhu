// 来访统计列表-月
export interface MonthTableInterface {
  projId: number;
  projName: string;
  syear: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  m6: number;
  m7: number;
  m8: number;
  m9: number;
  m10: number;
  m11: number;
  m12: number;
}
// 来访统计列表-天
export interface DayTableInterface {
  projId: number;
  projName: string;
  syear: number;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  d5: number;
  d6: number;
  d7: number;
  d8: number;
  d9: number;
  d10: number;
  d11: number;
  d12: number;
  d13: number;
  d14: number;
  d15: number;
  d16: number;
  d17: number;
  d18: number;
  d19: number;
  d20: number;
  d21: number;
  d22: number;
  d23: number;
  d24: number;
  d25: number;
  d26: number;
  d27: number;
  d28: number;
  d29?: number;
  d30?: number;
  d31?: number;
}
// 转化率统计
export interface ConversionRateInterface {
  projId: number;
  projName: string;
  dylfComeNum: number;
  dyrgNum: number;
  dylfrgNum: number;
  qqlfrgNum: number;
  sylfComeNum: number;
  syrgNum: number;
  sylfrgNum: number;
  dylfZhl: number;
  sylfZhl: number;
  dyztZhl: number;
  syztZhl: number;
}

