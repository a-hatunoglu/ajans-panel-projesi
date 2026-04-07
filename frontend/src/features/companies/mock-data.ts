import { Company } from "./types";

export const MOCK_COMPANIES: Company[] = [
  {
    id: "1",
    name: "TechCorp Inc.",
    slug: "techcorp-inc",
    website: "techcorp.example.com",
    isActive: true,
    _count: { companyUsers: 4 },
  },
  {
    id: "2",
    name: "Nexus Dynamics",
    slug: "nexus-dynamics",
    website: "nexus.example.com",
    isActive: true,
    _count: { companyUsers: 2 },
  },
  {
    id: "3",
    name: "Horizon Labs",
    slug: "horizon-labs",
    website: "horizon.example.com",
    isActive: false,
    _count: { companyUsers: 5 },
  },
  {
    id: "4",
    name: "Vantage Point Studios",
    slug: "vantage-point-studios",
    website: "vantage.example.com",
    isActive: true,
    _count: { companyUsers: 3 },
  },
  {
    id: "5",
    name: "BlueShift Retail",
    slug: "blueshift-retail",
    website: "blueshift.example.com",
    isActive: false,
    _count: { companyUsers: 1 },
  },
];
