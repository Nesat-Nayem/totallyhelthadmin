import { currency } from '@/context/constants'
import { PageType, StatType } from './types'

export const stateData: StatType[] = [
  {
    icon: 'solar:dollar-bold',
    name: 'Total Sales',
    amount: '13,647',
    variant: 'success',
    url: '/sales/sales-list',
  },

  {
    icon: 'solar:cart-5-bold-duotone',
    name: 'Branch wise sales',
    amount: '976',
    variant: 'danger',
    url: '/products/products-list',
  },

  {
    icon: 'solar:gift-bold-duotone',
    name: 'Brand wise sales',
    amount: '123',
    variant: 'success',
    url: '/customer/customer-list',
  },
  {
    icon: 'solar:user-rounded-bold-duotone',
    name: 'Total member Registered today',
    amount: '2000',
    variant: 'success',
    url: '/contact-us',
  },
  {
    icon: 'solar:chat-square-bold-duotone',
    name: 'Total aggregators sales today',
    amount: '123k',
    variant: 'warning',
    url: '/menu-plan-order-history',
  },

  {
    icon: 'solar:dollar-bold',
    name: 'Total expense today',
    amount: '123',
    variant: 'warning',
    url: '/pages/restaurants',
  },
]

export const pagesList: PageType[] = [
  {
    path: 'larkon/ecommerce.html',
    views: 465,
    rate: '4.4',
    variant: 'success',
  },
  {
    path: 'larkon/dashboard.html',
    views: 426,
    rate: '20.4',
    variant: 'danger',
  },
  {
    path: 'larkon/chat.html',
    views: 254,
    rate: '12.25',
    variant: 'warning',
  },
  {
    path: 'larkon/auth-login.html',
    views: 3369,
    rate: '5.2',
    variant: 'success',
  },
  {
    path: 'larkon/email.html',
    views: 985,
    rate: '64.2',
    variant: 'danger',
  },
  {
    path: 'larkon/social.html',
    views: 653,
    rate: '2.4',
    variant: 'success',
  },
  {
    path: 'larkon/blog.html',
    views: 478,
    rate: '1.4',
    variant: 'danger',
  },
]
