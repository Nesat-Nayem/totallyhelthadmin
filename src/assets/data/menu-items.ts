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
  {
    key: 'sales',
    label: 'Sales',
    icon: 'solar:cart-5-bold-duotone',
    children: [
      // {
      //   key: 'pos-child',
      //   label: 'POS',
      //   url: '/sales/pos',
      //   parentKey: 'sales',
      // },
      {
        key: 'sales-list',
        label: 'Sales List',
        url: '/sales/sales-list',
        parentKey: 'sales',
      },
    ],
  },
  {
    key: 'restaurant-menu-category',
    icon: 'solar:clipboard-list-bold-duotone',
    label: 'Menu Category',
    url: '/pages/restaurants-menu-category',
  },
  {
    key: 'brand-master',
    icon: 'solar:gift-bold-duotone',
    label: 'Brands',
    url: '/brands',
  },
  {
    key: 'meal-plan',
    label: 'Meal Plan',
    icon: 'solar:cup-hot-broken',
    children: [
      {
        key: 'add-meal-plan',
        label: 'Add Meal Plan',
        url: '/meal-plan/add-meal-plan',
        parentKey: 'meal-plan',
      },
      {
        key: 'meal-plan-list',
        label: 'Meal Plan List',
        url: '/meal-plan/meal-plan-list',
        parentKey: 'meal-plan',
      },
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
    ],
  },
  {
    key: 'customer',
    label: 'Customers',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    children: [
      {
        key: 'customer-add',
        label: 'Add Customer',
        url: '/customer/customer-add',
        parentKey: 'customer',
      },
      {
        key: 'customer-list',
        label: 'Customer List',
        url: '/customer/customer-list',
        parentKey: 'customer',
      },
    ],
  },
  {
    key: 'staff',
    label: 'Staff',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    children: [
      {
        key: 'waiter-list',
        label: 'Waiter Master',
        url: '/staff/waiter-list',
        parentKey: 'staff',
      },
      {
        key: 'delivery-boy-master',
        label: 'Delivery Boy Master',
        url: '/staff/delivery-boy-master',
        parentKey: 'staff',
      },
    ],
  },

  {
    key: 'invoices',
    icon: 'solar:clipboard-list-bold-duotone',
    label: 'Invoices',
    url: '/invoices',
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
        label: 'Sales Report',
        url: '/reports/sales-report',
        parentKey: 'reports',
      },
      
      // {
      //   key: 'all-income',
      //   label: 'Collection Report',
      //   url: '/reports/all-income',
      //   parentKey: 'reports',
      // },

      // {
      //   key: 'vat-report',
      //   label: 'VAT Report',
      //   url: '/reports/vat-report',
      //   parentKey: 'reports',
      // },
      // {
      //   key: 'discount-report',
      //   label: 'Discount Report',
      //   url: '/reports/discount-report',
      //   parentKey: 'reports',
      // },

      // // {
      // //   key: 'staff-report',
      // //   label: 'Staff  Report',
      // //   url: '/reports/discount-report',
      // //   parentKey: 'reports',
      // // },
      // {
      //   key: 'unpaid-report',
      //   label: 'Unpaid Delivery  Report',
      //   url: '/reports/unpaid-report',
      //   parentKey: 'reports',
      // },
      // {
      //   key: 'category-wise-report',
      //   label: 'Category Wise Report',
      //   url: '/reports/category-wise-report',
      //   parentKey: 'reports',
      // },
      // {
      //   key: 'order-wise-report',
      //   label: 'Order Type Wise Report',
      //   url: '/reports/order-wise-report',
      //   parentKey: 'reports',
      // },
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
        key: 'expense-list',
        label: 'Expense List',
        url: '/expenses/expense-list',
        parentKey: 'expenses',
      },
    ],
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
        key: 'about-us',
        label: 'About Us',
        url: '/pages/about-us',
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
    key: 'sample-menu',
    label: 'Sample Menu',
    icon: 'solar:document-bold-duotone',
    url: '/meal-plan/sample-menu',
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
    key: 'settings',
    label: 'Settings',
    icon: 'solar:settings-bold-duotone',
    url: '/settings',
  },
]
