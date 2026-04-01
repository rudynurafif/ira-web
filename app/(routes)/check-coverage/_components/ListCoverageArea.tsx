import { getListLocation } from "@/app/_api/Location/Location";
import Accordion from "@/app/_components/ItemComponent/Accordion";
import { dummyCoveredLocations } from "@/app/_shared/data/location";
import { formatNamaWilayah } from "@/app/_shared/utils";
import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";

export interface ListCoverageAreaProps {
  province_id: number;
  province_name: string;
  cities: City[];
}

export interface City {
  city_id: number;
  city_name: string;
  status: string;
}

function ListCoverageArea() {
  const [listArea, setListArea] = useState<ListCoverageAreaProps[]>([]);

  useEffect(() => {
    getListArea();
  }, []);

  async function getListArea() {
    try {
      const params = {
        // status: "live",
      };

      const res_getListLocation = await getListLocation({});

      // console.log(res_getListLocation.data);

      // setListArea(res_getListLocation.data);
      // setListArea(res_getListLocation);
      setListArea(dummyCoveredLocations);
    } catch (error: any) {
      console.log(error?.response?.data?.message || error?.message || "Error");
    }
  }

  return (
    <div className="px-5 md:px-10 mt-[140px]">
      {/* new */}
      <div className="relative border-3 md:border-[5px] border-[#E71919] rounded-2xl md:rounded-[47px] px-5 py-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D60000] border-[7px] border-white px-5 py-3 w-fit rounded-[20px]">
          <p className="text-lg md:text-xl lg:text-3xl text-white font-medium text-center">
            <span className="font-bold">Daftar area</span> jangkauan saat ini
          </p>
        </div>

        {/* list area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-min gap-5 my-10">
          <div className="col-span-1">
            {listArea.map((area, idx) => {
              if (idx <= 5) {
                return (
                  <div key={"area-" + idx}>
                    <p className="text-base sm:text-base md:text-lg font-bold mb-5">
                      {area.province_name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {area.cities.map((city, idx) => {
                        return (
                          <div
                            key={"city-" + idx}
                            className="flex items-center gap-2 col-span-1"
                          >
                            <FaMapLocationDot size={20} color="#D6211E" />
                            <p className="text-base sm:text-base md:text-lg capitalize">
                              {formatNamaWilayah(city.city_name.toLowerCase())}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="my-3 border border-gray-300"></div>
                  </div>
                );
              }
            })}
          </div>

          <div className="col-span-1">
            {listArea.map((area, idx) => {
              if (idx > 5) {
                return (
                  <div key={"area-" + idx}>
                    <p className="text-base sm:text-base md:text-lg font-bold mb-5">
                      {area.province_name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 px-5 self-start">
                      {area.cities.map((city, idx) => {
                        return (
                          <div
                            key={"city-" + idx}
                            className="flex items-center gap-2"
                          >
                            <FaMapLocationDot size={20} color="#D6211E" />
                            <p className="text-base sm:text-base md:text-lg capitalize">
                              {formatNamaWilayah(city.city_name.toLowerCase())}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className={
                        idx === listArea.length - 1
                          ? ""
                          : "my-3 border border-gray-300"
                      }
                    ></div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>

      {/* old */}
      {/* <div className="py-9 px-[5%] min-[1261px]:px-[10%] bg-dark-primary">
        <h1 className="text-base text-white sm:text-lg md:text-2xl font-bold">
          Daftar area jangkauan saat ini
        </h1>
      </div> */}
      {/* <div className="py-9 px-[5%] min-[1261px]:px-[10%]">
        <div className="md:block hidden">
          {listArea.map((area, idx) => {
            return (
              <div
                key={"area-" + idx}
                className={
                  idx < listArea.length - 1
                    ? "border-b border-[#C5C5C5] pb-5 mb-5"
                    : ""
                }
              >
                <p className="text-base sm:text-base md:text-lg font-bold mb-5">
                  {area.province_name}
                </p>
                <div className="grid grid-cols-3 gap-5 px-5">
                  {area.cities.map((city, idx) => {
                    return (
                      <div
                        key={"city-" + idx}
                        className="flex items-center gap-2"
                      >
                        <FaMapLocationDot size={20} color="#D6211E" />
                        <p className="text-base sm:text-base md:text-lg capitalize">
                          {formatNamaWilayah(city.city_name.toLowerCase())}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="md:hidden block">
          {listArea.map((area, idx) => {
            return (
              <Accordion key={area.province_id} title={area.province_name}>
                {area.cities.map((city, idx) => {
                  return (
                    <div
                      key={city.city_id}
                      className="flex items-center gap-2 py-1"
                    >
                      <FaMapLocationDot size={20} color="#D6211E" />
                      <p className="text-sm capitalize">
                        {formatNamaWilayah(city.city_name.toLowerCase())}
                      </p>
                    </div>
                  );
                })}
              </Accordion>
            );
          })}
        </div>
      </div> */}
    </div>
  );
}

export default ListCoverageArea;
