// Generate Receipt HTML directly from order data (bypasses React rendering)

export const generateReceiptHTML = (orderData: any, receiptType: 'customer' | 'kitchen'): string => {
  if (!orderData) return ''

  // Extract and convert all numeric values
  const vatPercent = (orderData.vatPercent !== undefined && orderData.vatPercent !== null && orderData.vatPercent !== '') ? Number(orderData.vatPercent) : 5
  const subTotal = (orderData.subTotal !== undefined && orderData.subTotal !== null && orderData.subTotal !== '') ? Number(orderData.subTotal) : 0
  
  let vatAmount = 0
  if (orderData.vatAmount !== undefined && orderData.vatAmount !== null && orderData.vatAmount !== '') {
    vatAmount = Number(orderData.vatAmount)
  } else if (subTotal > 0) {
    vatAmount = subTotal - (subTotal / (1 + vatPercent / 100))
  }
  
  let basePriceWithoutVAT = 0
  if (orderData.basePriceWithoutVAT !== undefined && orderData.basePriceWithoutVAT !== null && orderData.basePriceWithoutVAT !== '') {
    basePriceWithoutVAT = Number(orderData.basePriceWithoutVAT)
  } else if (subTotal > 0) {
    if (vatAmount > 0) {
      basePriceWithoutVAT = subTotal - vatAmount
    } else {
      basePriceWithoutVAT = subTotal / (1 + vatPercent / 100)
    }
  }
  
  const totalAmount = (orderData.total !== undefined && orderData.total !== null && orderData.total !== '') ? Number(orderData.total) : ((orderData.totalAmount !== undefined && orderData.totalAmount !== null && orderData.totalAmount !== '') ? Number(orderData.totalAmount) : 0)
  const discountAmountApplied = (orderData.discountAmount !== undefined && orderData.discountAmount !== null && orderData.discountAmount !== '') ? Number(orderData.discountAmount) : 0
  const deliveryCharge = (orderData.shippingCharge !== undefined && orderData.shippingCharge !== null && orderData.shippingCharge !== '') ? Number(orderData.shippingCharge) : ((orderData.deliveryCharge !== undefined && orderData.deliveryCharge !== null && orderData.deliveryCharge !== '') ? Number(orderData.deliveryCharge) : 0)
  const rounding = (orderData.rounding !== undefined && orderData.rounding !== null && orderData.rounding !== '') ? Number(orderData.rounding) : 0

  // Get items from selectedProducts or items array
  const items: any[] = []
  if (orderData.selectedProducts && Object.keys(orderData.selectedProducts).length > 0) {
    Object.entries(orderData.selectedProducts).forEach(([uniqueId, product]: [string, any]) => {
      items.push({
        title: product.title || product.name || '',
        price: (product.price !== undefined && product.price !== null) ? Number(product.price) : 0,
        qty: (product.qty !== undefined && product.qty !== null) ? Number(product.qty) : 1,
        moreOptions: product.moreOptions || [],
        itemOptions: orderData.itemOptions?.[uniqueId] || []
      })
    })
  } else if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
    orderData.items.forEach((item: any) => {
      items.push({
        title: item.title || item.name || '',
        price: (item.price !== undefined && item.price !== null) ? Number(item.price) : 0,
        qty: (item.qty !== undefined && item.qty !== null) ? Number(item.qty) : 1,
        moreOptions: item.moreOptions || [],
        itemOptions: []
      })
    })
  }

  // Get date/time
  const getCurrentDateTime = () => {
    const date = orderData.date ? new Date(orderData.date) : new Date()
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  // Get payment method
  const getPaymentMethod = () => {
    if (!orderData.payments || orderData.payments.length === 0) return 'CASH'
    const paymentTypes = [...new Set(orderData.payments.map((p: any) => p.type))]
    return paymentTypes.join(', ')
  }

  // Get order type display
  const getOrderTypeDisplay = (orderType: string | null) => {
    if (!orderType) return '–'
    switch (orderType.toLowerCase()) {
      case 'newmembership':
      case 'membershipmeal':
        return 'Membership'
      case 'dinein':
        return 'Dine In'
      case 'takeaway':
        return 'Take Away'
      case 'delivery':
        return 'Delivery'
      case 'online':
        return 'Online'
      default:
        return '–'
    }
  }

  // Generate items HTML
  const generateItemsHTML = () => {
    if (items.length === 0) return ''
    
    if (receiptType === 'customer') {
      return items.map((item) => {
        const itemTotal = item.price * item.qty
        const optionNames = item.itemOptions.length > 0 
          ? item.itemOptions 
          : (item.moreOptions || []).map((opt: any) => typeof opt === 'string' ? opt : (opt.name || opt))
        
        let optionsHTML = ''
        if (optionNames.length > 0) {
          optionsHTML = `<div style="margin-left: 10px; font-size: 9px; color: #666;">${optionNames.map((opt: string) => `<div style="margin-bottom: 1px;">+ ${opt}</div>`).join('')}</div>`
        }
        
        return `
          <div style="margin-bottom: 2px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 50%;">${item.title}</div>
              <div style="width: 15%; text-align: center;">${item.qty}</div>
              <div style="width: 35%; text-align: right;">${itemTotal.toFixed(2)}</div>
            </div>
            ${optionsHTML}
          </div>
        `
      }).join('')
    } else {
      // Kitchen receipt
      return items.map((item) => {
        const optionNames = item.itemOptions.length > 0 
          ? item.itemOptions 
          : (item.moreOptions || []).map((opt: any) => typeof opt === 'string' ? opt : (opt.name || opt))
        
        let optionsHTML = ''
        if (optionNames.length > 0) {
          optionsHTML = `<div style="margin-left: 10px; font-size: 9px; color: #666;">${optionNames.map((opt: string) => `<div style="margin-bottom: 1px;">+ ${opt}</div>`).join('')}</div>`
        }
        
        return `
          <div style="margin-bottom: 2px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 20%;">${item.qty}</div>
              <div style="width: 80%;">${item.title}</div>
            </div>
            ${optionsHTML}
          </div>
        `
      }).join('')
    }
  }

  if (receiptType === 'customer') {
    return `
      <div class="thermal-receipt customer-receipt" style="width: 300px; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.1; padding: 5px; background-color: white; color: black; margin: 0 auto;">
        <!-- Header with Logo -->
        <div style="text-align: center; margin-bottom: 8px;">
          <div class="logo-circle" style="border: 2px dashed #000; border-radius: 50%; width: 80px; height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 8px auto; padding: 8px; position: relative; box-sizing: border-box;">
            <div style="font-size: 14px; margin-bottom: 3px; font-weight: bold; color: #000; line-height: 1;">🍴</div>
            <div style="font-size: 9px; font-weight: bold; font-style: italic; text-align: center; line-height: 1.1; margin-bottom: 1px; font-family: serif;">Totally Healthy</div>
            <div style="font-size: 6px; text-align: center; line-height: 1; font-family: Arial, sans-serif; font-weight: normal;">EAT CLEAN LIVE HEALTHY</div>
          </div>
          <div style="font-size: 11px; font-weight: bold;">TAX INVOICE</div>
        </div>
        
        <!-- Company Info -->
        <div style="text-align: center; margin-bottom: 10px;">
          <div style="font-weight: bold;">TOTALLY HEALTHY</div>
          <div>Company Name AL AKL AL SAHI</div>
          <div>Tel 065392229 / 509632223</div>
          <div>TRN : 100512693100003</div>
        </div>
        
        <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;" />
        
        <!-- Order Info -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <div>BillNo:</div>
            <div>${orderData.invoiceNo || orderData.orderNo || 'N/A'}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <div>Date :</div>
            <div>${getCurrentDateTime()}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <div>User :</div>
            <div>${getPaymentMethod()}</div>
          </div>
          ${orderData.selectedOrderType || orderData.orderType ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <div>Order Type :</div>
            <div>${getOrderTypeDisplay(orderData.selectedOrderType || orderData.orderType)}</div>
          </div>
          ` : ''}
        </div>
        
        <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;" />
        
        <!-- Items Header -->
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
          <div style="width: 50%;">Items</div>
          <div style="width: 15%; text-align: center;">Qty</div>
          <div style="width: 35%; text-align: right;">Amount</div>
        </div>
        
        <!-- Items -->
        ${generateItemsHTML()}
        
        <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;" />
        
        <!-- Bill Summary -->
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <div>BASE PRICE (Without VAT)</div>
            <div>${basePriceWithoutVAT.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <div>${vatPercent} % VAT AMOUNT</div>
            <div>${vatAmount.toFixed(2)}</div>
          </div>
          ${discountAmountApplied > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <div>DISCOUNT</div>
            <div>-${discountAmountApplied.toFixed(2)}</div>
          </div>
          ` : ''}
          ${deliveryCharge > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <div>DELIVERY CHARGE</div>
            <div>${deliveryCharge.toFixed(2)}</div>
          </div>
          ` : ''}
          ${rounding !== 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <div>ROUNDING</div>
            <div>${rounding > 0 ? '+' : ''}${rounding.toFixed(2)}</div>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <div>GRAND TOTAL</div>
            <div>${totalAmount.toFixed(2)}</div>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;" />
        
        ${orderData.notes && orderData.notes.trim() ? `
        <div style="margin-bottom: 8px;">
          <div style="font-weight: bold; margin-bottom: 3px;">ORDER NOTES:</div>
          <div style="font-size: 10px; line-height: 1.2; word-wrap: break-word; white-space: pre-wrap;">${orderData.notes}</div>
        </div>
        ` : ''}
        
        ${orderData.customer ? `
        <div style="margin-bottom: 8px;">
          <div>CUST. NAME : ${orderData.customer.name || ''}</div>
          ${orderData.customer.address ? `
          <div>Address : ${orderData.customer.address}</div>
          ` : ''}
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 10px; font-size: 10px;">
          Thank You & Come Again
        </div>
      </div>
    `
  } else {
    // Kitchen receipt
    return `
      <div class="thermal-receipt kitchen-receipt" style="width: 300px; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.1; padding: 5px; background-color: white; color: black; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 8px;">
          <div style="font-size: 14px; font-weight: bold;">NEW ORDER</div>
          <div style="font-size: 10px;">${getCurrentDateTime()}</div>
        </div>
        
        <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;" />
        
        <!-- Order Info -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <div>Order No:</div>
            <div>${orderData.orderNo || orderData.invoiceNo || 'N/A'}</div>
          </div>
          ${orderData.selectedOrderType || orderData.orderType ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <div>Order Type:</div>
            <div>${getOrderTypeDisplay(orderData.selectedOrderType || orderData.orderType)}</div>
          </div>
          ` : ''}
        </div>
        
        <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;" />
        
        <!-- Items Header -->
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
          <div style="width: 20%;">Item Quantity</div>
          <div style="width: 80%;">Item</div>
        </div>
        
        <!-- Items -->
        ${generateItemsHTML()}
        
        ${orderData.notes && orderData.notes.trim() ? `
        <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;" />
        <div style="margin-bottom: 8px;">
          <div style="font-weight: bold; margin-bottom: 3px;">NOTES:</div>
          <div style="font-size: 10px; line-height: 1.2; word-wrap: break-word; white-space: pre-wrap;">${orderData.notes}</div>
        </div>
        ` : ''}
      </div>
    `
  }
}


