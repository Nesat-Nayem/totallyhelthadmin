import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// export type OrderType = 'dine-in' | 'takeaway' | 'delivery' | 'online' | 'membership'
export type OrderType = 'DineIn' | 'TakeAway' | 'Delivery' | 'online' | 'NewMembership' | 'MembershipMeal'

export type PriceType = 'restaurant' | 'online' | 'membership'

interface PosState {
  selectedOrderType: OrderType | null
  selectedPriceType: PriceType | null
  showOrderTypeModal: boolean
  isLoading: boolean
  editingOrder: any | null
  isEditMode: boolean
  currentOrderData: {
    selectedProducts: { [key: string]: any }
    itemOptions: { [itemId: string]: string[] }
    customer: any | null
    discount: { type: string; amount: number; reason: string } | null
    deliveryCharge: number
    rounding: number
    notes: string
    receiveAmount: number
    cumulativePaid: number
    payments: Array<{ type: 'Cash' | 'Card' | 'Gateway'; methodType: 'direct' | 'split'; amount: number }>
    selectedAggregator: string
    invoiceNo: string
    orderNo: string
    startDate: string
    endDate: string
    subTotal: number
    totalAmount: number
    payableAmount: number
    changeAmount: number
    discountAmountApplied: number
    selectedOrderType: OrderType | null
    selectedPriceType: PriceType | null
  } | null
}

const initialState: PosState = {
  selectedOrderType: null,
  selectedPriceType: null,
  showOrderTypeModal: true, // Show modal on initial load
  isLoading: false,
  editingOrder: null,
  isEditMode: false,
  currentOrderData: null,
}

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setOrderType: (state, action: PayloadAction<{ orderType: OrderType; priceType: PriceType }>) => {
      state.selectedOrderType = action.payload.orderType
      state.selectedPriceType = action.payload.priceType
      state.showOrderTypeModal = false
    },
    showOrderTypeModal: (state) => {
      state.showOrderTypeModal = true
    },
    hideOrderTypeModal: (state) => {
      state.showOrderTypeModal = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    resetPosState: (state) => {
      state.selectedOrderType = null
      state.selectedPriceType = null
      state.showOrderTypeModal = true
      state.isLoading = false
      state.editingOrder = null
      state.isEditMode = false
    },
    setEditMode: (state, action: PayloadAction<{ orderData: any; orderType: OrderType; priceType: PriceType }>) => {
      state.editingOrder = action.payload.orderData
      state.isEditMode = true
      state.selectedOrderType = action.payload.orderType
      state.selectedPriceType = action.payload.priceType
      state.showOrderTypeModal = false
    },
    exitEditMode: (state) => {
      state.editingOrder = null
      state.isEditMode = false
      state.showOrderTypeModal = true
    },
    updateCurrentOrderData: (state, action: PayloadAction<Partial<PosState['currentOrderData']>>) => {
      if (state.currentOrderData) {
        state.currentOrderData = { ...state.currentOrderData, ...action.payload }
      } else {
        state.currentOrderData = action.payload as PosState['currentOrderData']
      }
    },
    clearCurrentOrderData: (state) => {
      state.currentOrderData = null
    },
  },
})

export const {
  setOrderType,
  showOrderTypeModal,
  hideOrderTypeModal,
  setLoading,
  resetPosState,
  setEditMode,
  exitEditMode,
  updateCurrentOrderData,
  clearCurrentOrderData,
} = posSlice.actions

export default posSlice.reducer
