import { CUSTOMER_URL } from "@/app/_shared/data/data";
import { apiSlice } from "./apiSlice";

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: `${CUSTOMER_URL}/detail`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Customer"],
    }),
  }),
});

export const { useGetProfileQuery } = customerApiSlice;
