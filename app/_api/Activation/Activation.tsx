import FwaAxios from "../FwaAxios";

export const Activation = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/customer/activation",
      method: "POST",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

/**
   Example response
    
    {
        "statusCode": 403,
        "message": "CPE belum terikat dengan SIM",
        "path": "/app/customer/activation",
        "timestamp": "2025-10-27T07:55:49.628Z"
    }

    {
        "statusCode": 409,
        "message": "CPE sudah teraktivasi",
        "path": "/app/customer/activation",
        "timestamp": "2025-10-27T07:53:29.132Z"
    }

    {
        "statusCode": 200,
        "data": {
            "cpe": {
                "id": "e657e96b-827e-42ff-9e8f-c9598a644c2a",
                "name": "CPE Rumah Andi",
                "serial_number": "SN123456789",
                "mac_address": "00:1A:2B:3C:4D:5E",
                "imei": "356789012345678",
                "status": "ok",
                "cpe_sim_binding_id": [
                    {
                        "id": "2121109b-0910-4140-9835-b43772551918",
                        "sim_id": {
                            "id": "9674018e-547e-44db-a3e3-e3cfedac46bd",
                            "imsi": "510101234567891",
                            "iccid": "8962101234567890124",
                            "msisdn": "081234567891"
                        },
                        "binding_date": null,
                        "binding_by": "manufacture",
                        "customer_id": null
                    }
                ]
            }
        },
        "message": "CPE siap untuk diaktivasi"
    }

 */
