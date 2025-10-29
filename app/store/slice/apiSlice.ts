import { BASE_URL } from "@/app/_shared/data/data";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Customer"],
  endpoints: (builder) => ({}),
});
