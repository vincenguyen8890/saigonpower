export type RateType = 'fixed' | 'variable' | 'indexed'
export type PlanType = 'residential' | 'commercial' | 'both'
export type EnergySource = 'conventional' | 'renewable' | 'mixed'

export interface Provider {
  id: string
  name: string
  logo?: string
  rating: number
  reviewCount: number
  website: string
  phone: string
  description: string
  badge?: string
}

export interface ElectricityPlan {
  id: string
  providerId: string
  provider: Provider
  name: string
  rateKwh: number            // cents per kWh at 1000 kWh usage
  rateKwh500?: number        // cents per kWh at 500 kWh usage
  rateKwh2000?: number       // cents per kWh at 2000 kWh usage
  termMonths: number
  rateType: RateType
  planType: PlanType
  renewablePercent: number
  cancellationFee: number    // in dollars, 0 = no fee
  monthlyFee: number         // base monthly fee
  avgMonthlyBill: number     // estimated at 1000 kWh
  badges: PlanBadge[]
  features: string[]
  termsUrl: string
  eflUrl: string             // Electricity Facts Label
  yracUrl?: string           // Your Rights as a Customer
  isActive: boolean
  availableZips?: string[]   // null = all of ERCOT
  createdAt: string
  updatedAt: string
}

export type PlanBadge = 'popular' | 'bestValue' | 'green' | 'noFee' | 'newPlan' | 'priceProtected'

export interface PlanFilter {
  provider?: string
  termMin?: number
  termMax?: number
  rateType?: RateType | 'all'
  minRenewable?: number
  maxRate?: number
  planType?: PlanType
}

export type PlanSortOption = 'lowestRate' | 'bestValue' | 'termAsc' | 'termDesc' | 'renewableHigh'

export interface QuoteRequest {
  id?: string
  serviceType: 'residential' | 'commercial'
  name: string
  email: string
  phone: string
  zip: string
  businessName?: string
  monthlyUsageKwh?: number
  notes?: string
  preferredLanguage: 'vi' | 'en'
  status?: 'new' | 'contacted' | 'quoted' | 'enrolled' | 'lost'
  source?: string
  createdAt?: string
}
