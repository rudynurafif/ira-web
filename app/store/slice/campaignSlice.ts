import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getSetting } from "@/app/_api/Settings/Settings";
import type { RootState } from "@/app/store/store";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

export const DEFAULT_EVENT_NAME = "Bola Gembira";
export const DEFAULT_PLATFORM_NAME = "Folaplus";

interface CampaignState {
  eventName: string;
  platformName: string;
  webBannerUrl: string;
  mobileBannerUrl: string;
  claimVoucherBannerUrl: string;
  status: LoadStatus;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: CampaignState = {
  eventName: DEFAULT_EVENT_NAME,
  platformName: DEFAULT_PLATFORM_NAME,
  webBannerUrl: "",
  mobileBannerUrl: "",
  claimVoucherBannerUrl: "",
  status: "idle",
  error: null,
  lastFetchedAt: null,
};

/**
 * Ambil setting campaign dari API.
 * - campaign_event_name    -> eventName       (default "Bola Gembira")
 * - platform_campaign_name -> platformName    (default "Folaplus")
 * - campaign_web_banner_url    -> webBannerUrl    (default "" -> fallback ke aset statis di komponen)
 * - campaign_mobile_banner_url -> mobileBannerUrl (default "")
 * - claim_voucher_web_banner_url -> claimVoucherBannerUrl (default "")
 * Kalau salah satu gagal/kosong, fallback ke default. Satu request gagal
 * tidak membatalkan yang lain (Promise.allSettled).
 */
export const fetchCampaignSettings = createAsyncThunk<
  {
    eventName: string;
    platformName: string;
    webBannerUrl: string;
    mobileBannerUrl: string;
    claimVoucherBannerUrl: string;
  },
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "campaign/fetchCampaignSettings",
  async () => {
    const [
      eventRes,
      platformRes,
      webBannerRes,
      mobileBannerRes,
      claimVoucherBannerRes,
    ] = await Promise.allSettled([
      getSetting("campaign_event_name"),
      getSetting("platform_campaign_name"),
      getSetting("campaign_web_banner_url"),
      getSetting("campaign_mobile_banner_url"),
      getSetting("claim_voucher_web_banner_url"),
    ]);

    const eventName =
      eventRes.status === "fulfilled"
        ? eventRes.value?.data?.data?.value || DEFAULT_EVENT_NAME
        : DEFAULT_EVENT_NAME;

    const platformName =
      platformRes.status === "fulfilled"
        ? platformRes.value?.data?.data?.value || DEFAULT_PLATFORM_NAME
        : DEFAULT_PLATFORM_NAME;

    const webBannerUrl =
      webBannerRes.status === "fulfilled"
        ? webBannerRes.value?.data?.data?.value || ""
        : "";

    const mobileBannerUrl =
      mobileBannerRes.status === "fulfilled"
        ? mobileBannerRes.value?.data?.data?.value || ""
        : "";

    const claimVoucherBannerUrl =
      claimVoucherBannerRes.status === "fulfilled"
        ? claimVoucherBannerRes.value?.data?.data?.value || ""
        : "";

    return {
      eventName,
      platformName,
      webBannerUrl,
      mobileBannerUrl,
      claimVoucherBannerUrl,
    };
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const s = getState().campaign;
      if (s.status === "loading") return false;
      if (s.status === "succeeded") return false; // sudah pernah fetch
      return true;
    },
  },
);

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    setEventName(state, action: PayloadAction<string>) {
      state.eventName = action.payload || DEFAULT_EVENT_NAME;
    },
    setPlatformName(state, action: PayloadAction<string>) {
      state.platformName = action.payload || DEFAULT_PLATFORM_NAME;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignSettings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCampaignSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.eventName = action.payload.eventName;
        state.platformName = action.payload.platformName;
        state.webBannerUrl = action.payload.webBannerUrl;
        state.mobileBannerUrl = action.payload.mobileBannerUrl;
        state.claimVoucherBannerUrl = action.payload.claimVoucherBannerUrl;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchCampaignSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Gagal memuat campaign setting";
        // tetap pakai default value yang sudah ada di state
      });
  },
});

export const { setEventName, setPlatformName } = campaignSlice.actions;
export default campaignSlice.reducer;

/** selectors */
export const selectCampaignState = (s: RootState) => s.campaign;
export const selectEventName = (s: RootState) => s.campaign.eventName;
export const selectPlatformName = (s: RootState) => s.campaign.platformName;
export const selectWebBannerUrl = (s: RootState) => s.campaign.webBannerUrl;
export const selectMobileBannerUrl = (s: RootState) => s.campaign.mobileBannerUrl;
export const selectClaimVoucherBannerUrl = (s: RootState) =>
  s.campaign.claimVoucherBannerUrl;
