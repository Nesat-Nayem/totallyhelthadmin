import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// export type OrderType = 'dine-in' | 'takeaway' | 'delivery' | 'online' | 'membership'
export type OrderType = 'DineIn' | 'TakeAway' | 'Delivery' | 'online' | 'membership'

export type PriceType = 'restaurant' | 'online' | 'membership'

interface PosState {
  selectedOrderType: OrderType | null
  selectedPriceType: PriceType | null
  showOrderTypeModal: boolean
  isLoading: boolean
}

const initialState: PosState = {
  selectedOrderType: null,
  selectedPriceType: null,
  showOrderTypeModal: true, // Show modal on initial load
  isLoading: false,
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
    },
  },
})

export const {
  setOrderType,
  showOrderTypeModal,
  hideOrderTypeModal,
  setLoading,
  resetPosState,
} = posSlice.actions

export default posSlice.reducer
