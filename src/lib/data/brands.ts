export interface BrandConfig {
  id: string;
  name: string;
  domain: string;
  logoMark: string;
  accentColor: string;
  dataPath: string;
}

export const BRANDS: BrandConfig[] = [
  {
    id: "momcozy",
    name: "Momcozy",
    domain: "momcozy.com",
    logoMark: "M",
    accentColor: "#5079D9",
    dataPath: "../lute-momcozy-audit/src/_data",
  },
];

export function getBrand(id: string): BrandConfig | undefined {
  return BRANDS.find((b) => b.id === id);
}
