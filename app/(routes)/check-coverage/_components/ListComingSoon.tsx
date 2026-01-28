import { getListLocation } from "@/app/_api/Location/Location";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";

interface ListCoverageAreaProps {
  id: string | number;
  name: string;
}
function ListComingSoon() {
  // const listArea: ListCoverageAreaProps[] = [
  //   {
  //     id: 1,
  //     name: "DKI Jakarta",
  //   },
  //   {
  //     id: 2,
  //     name: "Banten",
  //   },
  //   {
  //     id: 3,
  //     name: "Jawa Barat",
  //   },
  //   {
  //     id: 4,
  //     name: "Jawa Timur",
  //   },
  //   {
  //     id: 5,
  //     name: "Jawa Tengah",
  //   },
  //   {
  //     id: 6,
  //     name: "DI. Yogyakarta",
  //   },
  // ];

  const [listArea, setListArea] = useState<ListCoverageAreaProps[]>([]);

  useEffect(() => {
    getListArea();
  }, []);

  async function getListArea() {
    try {
      const params = {
        status: "live",
      };

      const res_getListLocation = await getListLocation(params);

      // console.log(res_getListLocation.data);

      const temp = (res_getListLocation ?? []).map((item: any) => {
        return {
          id: item.id,
          name: item.name,
        };
      });

      setListArea(temp);
    } catch (err: any) {
      toastErrorFromAPI(err);
    }
  }

  return (
    <div className="py-20 px-[5%] min-[1261px]:px-[10%]">
      <h1 className="text-base sm:text-lg md:text-2xl font-bold">
        Daftar area jangkauan yang akan datang
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center mt-7 gap-x-3 gap-y-6">
        {listArea.map((data, index) => {
          return (
            <div className="col-span-1" key={"coming-soon-" + index}>
              <div className="flex items-center gap-2 px-6 py-5 rounded-xl bg-[#F2F2F2] text-[#666666]">
                <FaMapLocationDot size={20} color="#666666" />
                <p className="sm:text-base md:text-xl">{data.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListComingSoon;
