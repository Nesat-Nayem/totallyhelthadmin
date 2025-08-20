import { BootstrapVariantType } from '@/types/component-props'

export type StatType = {
  icon: string
  name: string
  amount: string
  variant: BootstrapVariantType
  url: string
}

export type PageType = {
  path: string
  views: number
  rate: string
  variant: BootstrapVariantType
}
