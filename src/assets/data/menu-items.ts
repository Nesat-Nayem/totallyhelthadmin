import { use } from 'react'
import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'pos',
    label: 'POS',
    isTitle: true,
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'solar:widget-5-bold-duotone',
    url: '/dashboard',
  },
  // {
  //   key: 'pos-module',
  //   label: 'POS Module',
  //   icon: 'solar:cart-5-bold-duotone',
  //   children: [
  //     {
  //       key: 'pos-main',
  //       label: 'POS Main',
  //       url: '/pos',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'settle-bill',
  //       label: 'Settle Bill',
  //       url: '/pos/settle-bill',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'print-order',
  //       label: 'Print Order',
  //       url: '/pos/print-order',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'pos-reports',
  //       label: 'POS Reports',
  //       url: '/pos/reports',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'view-orders',
  //       label: 'View Orders',
  //       url: '/pos/view-orders',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'transaction-history',
  //       label: 'Transaction History',
  //       url: '/pos/transaction-history',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'split-bill',
  //       label: 'Split Bill',
  //       url: '/pos/split-bill',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'apply-discount',
  //       label: 'Apply Discount',
  //       url: '/pos/apply-discount',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'meal-plan-list',
  //       label: 'Meal Plan List',
  //       url: '/pos/meal-plan-list',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'sales-list',
  //       label: 'Sales List',
  //       url: '/pos/sales-list',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'calculator',
  //       label: 'Calculator',
  //       url: '/pos/calculator',
  //       parentKey: 'pos-module',
  //     },
  //     {
  //       key: 'start-shift',
  //       label: 'Start Shift',
  //       url: '/pos/start-shift',
  //       parentKey: 'pos-module',
  //     },
  //   ],
  // },
  {
    key: 'sales',
    label: 'Sales',
    icon: 'solar:cart-5-bold-duotone',
    children: [
      {
        key: 'sales-list',
        label: 'Pay Type Sales ',
        url: '/sales/sales-list',
        parentKey: 'sales',
      },
      {
        key: 'membership-sales-list',
        label: 'Membership Sales ',
        url: '/sales/membership-sales-list',
        parentKey: 'sales',
      },
    ],
  },

  {
    key: 'menu-master',
    label: 'Menu Master',
    icon: 'solar:cup-hot-broken',
    children: [
      {
        key: 'Restaurant-menu',
        label: 'Restaurant Menu',
        url: '/menu-master/restaurant-menu',
        parentKey: 'menu-master',
      },
      {
        key: 'online-menu',
        label: 'Online Menu',
        url: '/menu-master/online-menu',
        parentKey: 'menu-master',
      },
      {
        key: 'membership-menu',
        label: 'Membership Menu',
        url: '/menu-master/membership-menu',
        parentKey: 'menu-master',
      },
      {
        key: 'add-new-menu',
        label: 'Add New Menu Item',
        url: '/menu-master/menu-add',
        parentKey: 'menu-master',
      },
      {
        key: 'menu-category',
        label: 'Menu Category',
        url: '/menu-master/menu-category',
        parentKey: 'menu-master',
      },
    ],
  },

  {
    key: 'paymeny-method',
    label: 'Payment Method',
    icon: 'solar:dollar-bold',
    children: [
      {
        key: 'list-of-payment-method',
        label: 'Payment Method',
        url: '/payment-method/list-of-payment-method',
        parentKey: 'payment-method',
      },
      {
        key: 'add-new-payment-method',
        label: 'Add  Payment Method',
        url: '/payment-method/add-new-payment-method',
        parentKey: 'payment-method',
      },
    ],
  },

  {
    key: 'branches',
    label: 'Branches',
    icon: 'solar:box-bold-duotone',
    children: [
      {
        key: 'list-of-branches',
        label: 'List of branches',
        url: '/branches/list-of-branches',
        parentKey: 'branches',
      },
      {
        key: 'add-new-branch',
        label: 'Add new branch',
        url: '/branches/add-new-branch',
        parentKey: 'branches',
      },
    ],
  },
  {
    key: 'brands',
    label: 'Brands',
    icon: 'solar:gift-bold-duotone',
    children: [
      {
        key: 'list-of-brands',
        label: 'List of brands',
        url: '/brands/list-of-brands',
        parentKey: 'brands',
      },
      {
        key: 'brand-menu',
        label: 'Brand Menu',
        url: '/brands/brand-menu',
        parentKey: 'brands',
      },
    ],
  },

  {
    key: 'meal-plan',
    label: 'Meal Plan',
    icon: 'solar:cup-hot-broken',
    children: [
      {
        key: 'add-meal-plan',
        label: 'Add new meal Plan',
        url: '/meal-plan/add-meal-plan',
        parentKey: 'meal-plan',
      },
      {
        key: 'meal-plan-list',
        label: 'Meal Plan List',
        url: '/meal-plan/meal-plan-list',
        parentKey: 'meal-plan',
      },
      {
        key: 'meal-plan-menu',
        label: 'Meal Plan Menu',
        url: '/meal-plan/sample-menu',
        parentKey: 'meal-plan',
      },
    ],
  },

  {
    key: 'membership',
    label: 'Membership Management',
    icon: 'solar:user-id-bold-duotone',
    children: [
      {
        key: 'membership-customers',
        label: 'Customers',
        url: '/membership/customers',
        parentKey: 'membership',
      },
      {
        key: 'membership-list',
        label: 'Meal Plans',
        url: '/meal-plan/meal-plan-list',
        parentKey: 'membership',
      },
      {
        key: 'user-membership',
        label: 'User Memberships',
        url: '/membership/user-membership',
        parentKey: 'membership',
      },
    ],
  },

  {
    key: 'aggregators',
    label: 'Aggregators',
    icon: 'solar:gift-bold-duotone',
    children: [
      {
        key: 'add-aggregators',
        label: 'Add new aggregator',
        url: '/aggregators/add-aggregators',
        parentKey: 'aggregators',
      },
      {
        key: 'aggregators-list',
        label: 'List of Aggregators',
        url: '/aggregators/aggregators-list',
        parentKey: 'aggregators',
      },
      // {
      //   key: 'aggregators-menu-linking',
      //   label: 'Menu linking for aggregator',
      //   url: '/aggregators/aggregators-menu-linking',
      //   parentKey: 'aggregators',
      // },
    ],
  },

  {
    key: 'inventory',
    label: 'Inventory',
    icon: 'solar:box-bold-duotone',
    children: [
      {
        key: 'add-inventory',
        label: 'Add Inventory',
        url: '/inventory/add-inventory',
        parentKey: 'inventory',
      },
      {
        key: 'inventory-list',
        label: 'Inventory List',
        url: '/inventory/inventory-list',
        parentKey: 'inventory',
      },
      {
        key: 'supplier-master',
        label: 'Supplier List',
        url: '/staff/supplier-list',
        parentKey: 'inventory',
      },
    ],
  },

  {
    key: 'expenses',
    label: 'Expenses',
    icon: 'solar:dollar-bold',
    children: [
      {
        key: 'add-expense',
        label: 'Add Expense',
        url: '/expenses/add-expense',
        parentKey: 'expenses',
      },
      {
        key: 'expense-types',
        label: 'Expense Types',
        url: '/expenses/expense-types',
        parentKey: 'expenses',
      },
      {
        key: 'suppliers',
        label: 'Suppliers',
        url: '/expenses/suppliers',
        parentKey: 'expenses',
      },
      {
        key: 'approved-bys',
        label: 'Approved By',
        url: '/expenses/approved-bys',
        parentKey: 'expenses',
      },
      {
        key: 'cash-expense',
        label: 'Cash Expense',
        url: '/expenses/cash-expense',
        parentKey: 'expenses',
      },
      {
        key: 'credit-expense',
        label: 'Credit Expense',
        url: '/expenses/credit-expense',
        parentKey: 'expenses',
      },
    ],
  },

  {
    key: 'customer',
    label: 'Customers Master',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    children: [
      {
        key: 'customer-add',
        label: 'Add new Customer',
        url: '/customer/customer-add',
        parentKey: 'customer',
      },
      {
        key: 'customer-list',
        label: 'Customer List',
        url: '/customer/customer-list',
        parentKey: 'customer',
      },
      {
        key: 'customer-membership-history-list',
        label: 'Customer Membership History',
        url: '/customer/customer-membership-history-list',
        parentKey: 'customer',
      },
    ],
  },

  {
    key: 'staff',
    label: 'Staff Master',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    children: [
      {
        key: 'waiter-list',
        label: 'Waiter List',
        url: '/staff/waiter-list',
        parentKey: 'staff',
      },
      {
        key: 'cashier-list',
        label: 'Cashier List',
        url: '/staff/cashier-list',
        parentKey: 'staff',
      },
      {
        key: 'add-new-waiter',
        label: 'Add new waiter',
        url: '/staff/waiter-add',
        parentKey: 'staff',
      },
      {
        key: 'add-new-cashier',
        label: 'Add new cashier',
        url: '/staff/add-new-cashier',
        parentKey: 'staff',
      },
    ],
  },

  {
    key: 'Shift-master',
    icon: 'solar:calendar-bold-duotone',
    label: 'Shift Close',
    url: '/shift-close',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'solar:bill-list-bold-duotone',
    children: [
      {
        key: 'membership-report',
        label: 'Membership Report',
        url: '/reports/membership-report',
        parentKey: 'reports',
      },
      {
        key: 'sales-report',
        label: 'Paytype wise Report',
        url: '/reports/paytype-wise-report',
        parentKey: 'reports',
      },
      {
        key: 'aggregator-sales-report',
        label: 'Aggregator Wise Report',
        url: '/reports/aggregator-wise-report',
        parentKey: 'reports',
      },
      {
        key: 'branch-sales-report',
        label: 'Branch Wise Sales Report',
        url: '/reports/branch-sales-report',
        parentKey: 'reports',
      },
      {
        key: 'pay-out-sales-report',
        label: 'Pay-out Report',
        url: '/reports/pay-out-report',
        parentKey: 'reports',
      },
      {
        key: 'supplier-wise-report',
        label: 'Supplier wise report',
        url: '/reports/supplier-wise-report',
        parentKey: 'reports',
      },
      {
        key: 'cancelled-bills-report',
        label: 'Cancelled Bills Reports',
        url: '/reports/cancel-report',
        parentKey: 'reports',
      },
      {
        key: 'discount-report',
        label: 'Discount Report',
        url: '/reports/discount-report',
        parentKey: 'reports',
      },
      {
        key: 'vat-report',
        label: 'Vat Report',
        url: '/reports/vat-report',
        parentKey: 'reports',
      },
      {
        key: 'day-closing',
        label: 'Day closing',
        url: '/reports/day-close-report',
        parentKey: 'reports',
      },
    ],
  },

  {
    key: 'more-options',
    icon: 'solar:cup-hot-broken',
    label: 'More Options',
    url: '/more-options',
  },

  {
    key: 'enquiry',
    label: 'Enquiries',
    isTitle: true,
  },
  {
    key: 'contact-us',
    label: 'Contact Us Enquiry',
    icon: 'solar:phone-bold-duotone',
    url: '/contact-us',
  },
  {
    key: 'get-in-touch',
    label: 'Get In Touch',
    icon: 'solar:phone-calling-bold-duotone',
    url: '/get-in-touch',
  },
  {
    key: 'meal-plan-order-history',
    label: 'Meal Plan Order History',
    icon: 'solar:cart-5-bold-duotone',
    url: '/menu-plan-order-history',
  },
  {
    key: 'web-pages',
    label: 'Web Pages',
    isTitle: true,
  },
  {
    key: 'pages',
    label: 'Pages',
    icon: 'solar:gift-bold-duotone',
    children: [
      {
        key: 'home-banner',
        label: 'Home Banner',
        url: '/pages/home-banner',
        parentKey: 'pages',
      },
      {
        key: 'goal',
        label: 'Goal',
        url: '/pages/goal',
        parentKey: 'pages',
      },
      {
        key: 'pages-brands',
        label: 'Brands',
        url: '/pages/brands',
        parentKey: 'pages',
      },
      {
        key: 'meal-plan-work',
        label: 'Meal Plan Work',
        url: '/pages/meal-plan-work',
        parentKey: 'pages',
      },
      {
        key: 'counter',
        label: 'Counter',
        url: '/pages/counter',
        parentKey: 'pages',
      },
      {
        key: 'compare',
        label: 'Compare',
        url: '/pages/compare',
        parentKey: 'pages',
      },
      {
        key: 'why-choose',
        label: 'Why Choose',
        url: '/pages/why-choose',
        parentKey: 'pages',
      },
      {
        key: 'video',
        label: 'Video Area',
        url: '/pages/video',
        parentKey: 'pages',
      },
      {
        key: 'testimonial',
        label: 'Testimonial',
        url: '/pages/testimonial',
        parentKey: 'pages',
      },
      {
        key: 'restaurants',
        label: 'Restaurants',
        url: '/pages/restaurants',
        parentKey: 'pages',
      },
      {
        key: 'restaurant-menu',
        label: 'Restaurants Menu',
        url: '/pages/restaurants-menu',
        parentKey: 'pages',
      },
      {
        key: 'restaurant-location',
        label: 'Restaurants Location',
        url: '/pages/restaurants-location',
        parentKey: 'pages',
      },
      {
        key: 'logo',
        label: 'Logo',
        url: '/pages/logo',
        parentKey: 'pages',
      },
      {
        key: 'subscription',
        label: 'Subscription',
        url: '/pages/subscription',
        parentKey: 'pages',
      },
    ],
  },
  {
    key: 'blog',
    label: 'Blog',
    icon: 'solar:document-bold-duotone',
    children: [
      {
        key: 'blog-category',
        label: 'Blog Category',
        url: '/blog/blog-category',
        parentKey: 'blog',
      },
      {
        key: 'add-blog',
        label: 'Add Blog',
        url: '/blog/add-blog',
        parentKey: 'blog',
      },
      {
        key: 'blog-list',
        label: 'Blog List',
        url: '/blog/blog-list',
        parentKey: 'blog',
      },
    ],
  },
  {
    key: 'about-us',
    label: 'About Details',
    icon: 'solar:info-circle-bold-duotone',
    children: [
      {
        key: 'about-us-details',
        label: 'About Details',
        url: '/about-us/about-us-details',
        parentKey: 'about-us',
      },
      {
        key: 'about-us-food',
        label: 'About Food',
        url: '/about-us/about-us-food',
        parentKey: 'about-us',
      },
      {
        key: 'about-us-author',
        label: 'About Author',
        url: '/about-us/about-us-author',
        parentKey: 'about-us',
      },
    ],
  },

  {
    key: 'support',
    label: 'SUPPORT',
    isTitle: true,
  },
  {
    key: 'faqs',
    label: 'FAQs',
    icon: 'solar:question-circle-bold-duotone',
    url: '/support/faqs',
  },
  {
    key: 'privacy-policy',
    label: 'Privacy Policy',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/privacy-policy',
  },
  {
    key: 'terms-conditions',
    label: 'Terms & Conditions',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/terms-conditions',
  },
  {
    key: 'custom',
    label: 'CUSTOM',
    isTitle: true,
  },
  {
    key: 'role-management-v2',
    label: 'Role Management V2',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    url: '/role-management-v2',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'solar:settings-bold-duotone',
    url: '/settings',
  },
]
