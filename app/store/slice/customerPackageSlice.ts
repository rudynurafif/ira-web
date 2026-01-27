import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCustomerPackage } from "@/app/_api/Customer/CustomerArea";
import type { RootState } from "@/app/store/store";
import type { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface CustomerPackageState {
  status: LoadStatus;
  error: string | null;

  // data non-pagination (full list / cukup besar)
  items: SubscriptionHistoryAPI[];

  // metadata untuk menghindari fetch berkali-kali
  lastCustomerCode: string | null;
  lastFetchedAt: number | null;
}

const initialState: CustomerPackageState = {
  status: "idle",
  error: null,
  items: [],
  lastCustomerCode: null,
  lastFetchedAt: null,
};

/**
 * Fetch sekali untuk satu customer.
 * Jika API kamu tetap butuh paging, pakai pageSize besar.
 * Sesuaikan max pageSize di backend kamu.
 */
export const fetchCustomerPackages = createAsyncThunk<
  { items: SubscriptionHistoryAPI[]; customerCode: string | null },
  { customerCode: string | null; force?: boolean },
  { state: RootState; rejectValue: string }
>(
  "customerPackage/fetchCustomerPackages",
  async ({ customerCode }, { rejectWithValue }) => {
    try {
      const res = await getCustomerPackage({
        page: 1,
        pageSize: 1000, // <--- adjust (atau hapus param kalau endpoint non pagination)
      });

      const items = (res?.data?.data ?? []) as SubscriptionHistoryAPI[];
      return { items, customerCode };
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal memuat data paket pelanggan";
      return rejectWithValue(msg);
    }
  },
  {
    condition: ({ customerCode, force }, { getState }) => {
      if (force) return true;
      const s = getState().customerPackage;

      // kalau sudah pernah fetch untuk customer yang sama dan masih ada data, skip
      if (s.status === "loading") return false;
      if (customerCode && s.lastCustomerCode === customerCode && s.items.length)
        return false;

      return true;
    },
  }
);

const customerPackageSlice = createSlice({
  name: "customerPackage",
  initialState,
  reducers: {
    clearCustomerPackages(state) {
      state.status = "idle";
      state.error = null;
      state.items = [];
      state.lastCustomerCode = null;
      state.lastFetchedAt = null;
    },
    setCustomerPackages(
      state,
      action: PayloadAction<SubscriptionHistoryAPI[]>
    ) {
      state.items = action.payload ?? [];
      state.status = "succeeded";
      state.error = null;
      state.lastFetchedAt = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerPackages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomerPackages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.items = action.payload.items ?? [];
        state.lastCustomerCode = action.payload.customerCode ?? null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchCustomerPackages.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Gagal memuat paket";
      });
  },
});

export const { clearCustomerPackages, setCustomerPackages } =
  customerPackageSlice.actions;

export default customerPackageSlice.reducer;

/** selectors */
export const selectCustomerPackageState = (s: RootState) => s.customerPackage;
export const selectCustomerPackages = (s: RootState) => s.customerPackage.items;

export const selectActivePackage = (s: RootState) => {
  const items = s.customerPackage.items ?? [];
  // asumsi: paket aktif punya start_date & end_date
  // kalau mau lebih ketat: cek status paket
  const active = items.find((x) => x?.start_date && x?.end_date) ?? null;
  return active;
};

export const selectShipmentStatusFromPackages = (s: RootState) => {
  const first = s.customerPackage.items?.[0];
  return first?.shipment_status ?? null;
};
