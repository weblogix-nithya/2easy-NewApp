// src/utils/buildQuotePayload.ts

export const buildQuotePayload = ({
  job,
  refinedData,
  jobItems,
  jobDestinations,
  pickUpDestination,
  companyRates,
  jobCategories,
  jobTypeOptions,
  depotOptions,
  readyAt,
  dropAt,
}: any) => {
  const today = new Date().toISOString();

  const jobDestination1 =
    jobDestinations?.length > 0
      ? {
          state: jobDestinations[0]?.address_state,
          suburb: jobDestinations[0]?.address_city,
          postcode: jobDestinations[0]?.address_postal_code,
          address: jobDestinations[0]?.address,
        }
      : null;

  const selectedCategoryName = jobCategories?.find(
    (c) => c.value === job?.job_category_id,
  )?.label;

  const selectedJobTypeName = jobTypeOptions?.find(
    (j) => j.value === job?.job_type_id,
  )?.label;

  const selectedDepot = depotOptions?.find(
    (d) => d.value === job?.timeslot_depots,
  )?.label;

  const filteredCompanyRates = companyRates?.filter(
    (rate) => rate.state === jobDestination1?.state,
  );

  return {
    // customer_id: Number(job?.customer_id),

    freight_type:
      refinedData.freight_type || selectedCategoryName,

    transport_type: job?.transport_type,

    service_choice: refinedData.service_choice,

    state:
      refinedData.state ||
      job?.pick_up_state ||
      pickUpDestination?.address_state,

    state_code:
      refinedData.state_code ||
      refinedData.pick_up_stateCode,

    company_rates:
      ((job?.job_category_id === 1 ||
        job?.job_category_id === 2) &&
        refinedData.pick_up_stateCode === "QLD") ||
      refinedData.pick_up_stateCode === "VIC"
        ? filteredCompanyRates?.map((rate) => ({
            company_id: rate.company_id,
            seafreight_id: rate.seafreight_id,
            area: rate.area,
            cbm_rate: rate.cbm_rate,
            minimum_charge: rate.minimum_charge,
          })) || []
        : [],

    job_pickup_address: {
      state: pickUpDestination?.address_state,
      suburb: pickUpDestination?.address_city,
      postcode: pickUpDestination?.address_postal_code,
      address: pickUpDestination?.address,
    },

    job_destination_address: jobDestination1 || {},

    pickup_time: { ready_by: readyAt },

    delivery_time: { drop_by: dropAt },

    surcharges: {
      hand_unload: job?.is_hand_unloading || false,
      dangerous_goods: job?.is_dangerous_goods || false,
      time_slot: job?.is_inbound_connect || false,
      timeslot_depots: job?.is_inbound_connect
        ? job?.timeslot_depots || selectedDepot
        : null,
      tail_lift: job?.is_tailgate_required || false,
      stackable: false,
    },

    job_items: jobItems?.map((item) => ({
      id: item.id,
      name: item.name || "",
      notes: item.notes || "",
      quantity: item.quantity,
      volume: item.volume,
      weight: item.weight,
      dimension_height: item.dimension_height,
      dimension_width: item.dimension_width,
      dimension_depth: item.dimension_depth,
      job_destination: jobDestination1 || null,
      item_type: {
        id: item?.item_type?.id || "",
        name: item?.item_type?.name || "",
      },
      created_at: refinedData.created_at || today,
      updated_at: refinedData.updated_at || today,
    })),
  };
};
