// types.ts
export interface SubjectItem {
  id: number;
  pid: number;
  subCode: string;
  subName: string;
  subLevel: number;
  idPath: string;
  busiSegId: number;
  busiSegName?: string;
  allocRule: string;
  allocRuleName?: string;
  isLeaf?: boolean;
  children?: SubjectItem[];
}

export interface AllocationDetail {
  subId: number;
  prodId: number;
  allocAmt: number;
  allocExclAmt: number;
  allocWarn: number;
  subName?: string;
  prodName?: string;
  busiSegId?: number;
  busiSegName?: string;
}

export interface BuildingInfo {
  id: number;
  projId: number;
  bldName: string;
  isUnderGround: boolean;
  prodIds: string; // "3017,3019"
  prodNames: string; // "小高,独立商业"
}

export interface ProductInfo {
  prodId: number;
  prodName: string;
}

export interface PageParams {
  projId?: number;
  projName: string;
  displayName: string;
  bizType: string;
  billId?: string;
  bizKeyId: number;
  allocAmt: number;
  allocExclAmt: number;
}
