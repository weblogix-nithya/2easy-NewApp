'use client';

import { useLazyQuery, useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import AuditLogTab from "@/components/jobs/AuditLogTab";
import InvoiceTab from "@/components/jobs/InvoiceTab";
import JobDetailsTab from "@/components/jobs/JobDetailsTab";
import MessageLogTab from "@/components/jobs/MessageLogTab";
import ReportsTab from "@/components/jobs/ReportsTab";
import { TabsComponent } from "@/components/tabs/TabsComponet";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { GET_COMPANY_QUERY, GET_COMPANYS_QUERY } from "@/graphql/company";
import { GET_COMPANY_RATE_QUERY } from "@/graphql/CompanyRate";
import { defaultCustomer, GET_CUSTOMERS_QUERY } from "@/graphql/customer";
import { GET_CUSTOMER_ADDRESSES_QUERY } from "@/graphql/customerAddress";
import { GET_DRIVERS_QUERY } from "@/graphql/driver";
import { GET_ITEM_TYPES_QUERY } from "@/graphql/itemType";
import defaultJobQuoteData, {
  defaultJob,
  defaultReportJob,
  DELETE_JOB_MUTATION,
  GET_ALL_TIMESLOT_DEPOTS,
  GET_JOB_QUERY,
  ReportJob,
  UPDATE_JOB_MUTATION,
} from "@/graphql/job";
import { GET_JOB_CATEGORIES_QUERY } from "@/graphql/jobCategories";
import {
  CREATE_JOB_CC_EMAIL_MUTATION,
  DELETE_JOB_CC_EMAIL_MUTATION,
  GET_JOB_EMAIL_TEMPLATE_QUERY,
  SEND_JOB_EMAIL,
} from "@/graphql/jobCcEmails";
import {
  CREATE_JOB_DESTINATION_MUTATION,
  defaultJobDestination,
  DELETE_JOB_DESTINATION_MUTATION,
  UPDATE_JOB_DESTINATION_MUTATION,
} from "@/graphql/jobDestination";
import {
  CREATE_JOB_ITEM_MUTATION,
  defaultJobItem,
  DELETE_JOB_ITEM_MUTATION,
  UPDATE_JOB_ITEM_MUTATION,
} from "@/graphql/jobItem";
import {
  CALCULATE_SEA_FREIGHT_QUERY,
  CREATE_JOB_PRICE_CALCULATION_DETAIL_MUTATION,
  CreateJobPriceCalculationDetailInput,
  defaultJobPriceCalculationDetail,
  GET_JOB_PRICE_CALCULATION_DETAIL_QUERY,
  UPDATE_JOB_PRICE_CALCULATION_DETAIL_MUTATION,
} from "@/graphql/JobPriceCalculationDetail";
import { GET_JOB_STATUSES_QUERY } from "@/graphql/jobStatus";
import { GET_JOB_TYPES_QUERY } from "@/graphql/jobType";
import { DELETE_MEDIA_MUTATION } from "@/graphql/media";
import {
  formatDate,
  formatDateTimeToDB,
  formatTimeUTCtoInput,
  today,
} from "@/lib/helpers/helper";
import debounce from "lodash.debounce";
import { useParams, useRouter } from "next/navigation";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { calculateFinalWeightCBM } from "@/utils/calculatePalletSpacesOccupied";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";

function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

function JobEdit() {
  const toast = useToast();
  const isMounted = useIsMounted();
  const textColorSecodary = useColorModeValue("#888888", "#888888");
  const [job, setJob] = useState(defaultJob);
  const [reportJob, setReportJob] = useState<ReportJob>(defaultReportJob);
  const [deleteReason, setDeleteReason] = useState("");

  const [refinedData, setRefinedData] = useState({
    ...defaultJobQuoteData,
    pick_up_state: "",
    pick_up_stateCode: "",
    timeslot_depots: "",
    toll_enabled: false,
    toll_levy_type: null,
  });
  const [quoteCalculationRes, setQuoteCalculationRes] = useState(
    defaultJobPriceCalculationDetail,
  );
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [_pricecalculationid, setPricecalculationid] = useState(null);
  const [buttonText, setButtonText] = useState("Get A Quote");
  const router = useRouter();
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [updatingMedia, setUpdatingMedia] = useState(false);
  const [tabId, setActiveTab] = useState(1);
  const refetchingRef = useRef(false);
  const [jobItems, setJobItems] = useState([defaultJobItem]);
  const [originalJobItems, setOriginalJobItems] = useState([]);
  const [customerSelected, setCustomerSelected] = useState(defaultCustomer);
  const [jobTypeOptions, setJobTypeOptions] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [jobStatuses, setJobStatuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [companiesOptions, setCompaniesOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [savedAddressesSelect, setSavedAddressesSelect] = useState([]);
  const [jobDateAt, setJobDateAt] = useState(today);
  const [readyAt, setReadyAt] = useState("06:00");
  const [dropAt, setDropAt] = useState("17:00");
  const [originalJobDestinations, setOriginalJobDestinations] = useState([]);
  const [jobDestinations, setJobDestinations] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedSearchDriver, setDebouncedSearchDriver] = useState("");
  const re = useMemo(() => {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  }, []);
  const [deleteJobCcEmailId, setDeleteJobCcEmailId] = useState(null);
  const [createdCcEmail, setCreatedCcEmail] = useState(null);
  const [jobCcEmails, setJobCcEmails] = useState([]);
  const [jobCcEmailTags, setJobCcEmailTags] = useState([]);
  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  const isCustomer = useSelector((state: RootState) => state.user.isCustomer);
  const isSubAdmin = useSelector((state: RootState) => state.user.isSubAdmin);
  const isAdminUser = isAdmin || isSubAdmin;

  const [pickUpDestination, setPickUpDestination] = useState(
    defaultJobDestination,
  );
  const [_isSameDayJob, setIsSameDayJob] = useState(false);
  const [_isTomorrowJob, setIsTomorrowJob] = useState(false);
  const [locationOptions, _setLocationOptions] = useState([
    { value: "VIC", label: "Victoria" },
    { value: "QLD", label: "Queensland" },
  ]);
  const [depotOptions, setDepotOptions] = useState([]);
  const [filtereddepotOptions, setFilteredDepotOptions] = useState([]);
  const [companyWeight, setCompanyWeight] = useState(null);
  const [companyToll, setCompanyToll] = useState(null);
  const [_selectedDepot, setSelectedDepot] = useState("");

  const [prevJobState, setPrevJobState] = useState({
    freight_type: refinedData.freight_type,
    transport_type: job.transport_type,
    transport_location: job.transport_location,
    job_items: jobItems,
  });

  const [companyRates, setCompanyRates] = useState([]);

  const [_selectedRegion, setSelectedRegion] = useState({
    area: "",
    cbm_rate: 0,
    minimum_charge: 0,
  });
  const [getEmailTemplate] = useLazyQuery(GET_JOB_EMAIL_TEMPLATE_QUERY, {
    fetchPolicy: "no-cache",
  });
  const [sendJobEmail] = useMutation(SEND_JOB_EMAIL);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const emailReasons = [
    "Futile",
    "Update CBM / Weight",
    "Waiting Time",
    "Late Delivery",
    "Move Job Date",
  ];

  const tabs = [
    {
      id: 1,
      tabName: "Job Details",
      hash: "job_details",
      isVisible: true,
    },
    {
      id: 2,
      tabName: "Reports",
      hash: "reports",
      isVisible: true,
    },
    {
      id: 3,
      tabName: "Message Log",
      hash: "message_log",
      isVisible: isAdminUser,
    },
    {
      id: 4,
      tabName: "Invoice",
      hash: "invoice",
      isVisible:
        isAdminUser ||
        !(
          isCustomer &&
          (job.customer_invoice == undefined ||
            job.customer_invoice?.invoice_status_id == 1)
        ),
    },
    {
      id: 5,
      tabName: "Audit Log",
      hash: "audit_log",
      isVisible: isAdminUser,
    },
  ];

  const itemsTableColumns = useMemo(
    () => [
      {
        header: "Type",
      },
      {
        header: "DIMENSIONS (L,W,H)",
      },
      {
        header: "QTY",
      },
      {
        header: "WEIGHT",
      },
      {
        header: "CBM",
      },
      {
        header: "ACTION",
      },
    ],
    [],
  );

  const attachmentColumns = useMemo(
    () => [
      {
        id: "file_name",
        header: "Document",
        accessorKey: "file_name" as const,
      },
      {
        id: "uploaded_by",
        header: "Uploaded by",
        accessorKey: "uploaded_by" as const,
      },
      {
        id: "created_at",
        header: "Date uploaded",
        accessorKey: "created_at" as const,
        meta: {
          type: "date",
        },
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "downloadable_url" as const,
        meta: {
          Header: "Actions",
          isDelete: isAdminUser,
          isEdit: false,
          isDownload: true,
        },
      },
    ],
    [isAdmin],
  );

  const onChangeSearchQuery = useMemo(() => {
    return debounce((e) => {
      setDebouncedSearch(e);
    }, 300);
  }, []);

  const onChangeCustomerSearchQuery = useMemo(() => {
    return debounce((e) => {
      setDebouncedSearchDriver(e);
    }, 300);
  }, []);

  const jobQueryVariables = useMemo(() => ({ id: id }), [id]);

  const {
    loading: jobLoading,
    data: jobData,
    refetch: getJob,
  } = useApolloQueryWithEffect(GET_JOB_QUERY, {
    variables: jobQueryVariables,
    skip: !id,
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      if (!isMounted.current) return;

      if (!data?.job) {
        router.push("/admin/jobs");
        return;
      }

      if (!updatingMedia) {
        setJob((prev) => ({
          ...prev,
          ...data?.job,
          company_id: parseInt(data?.job.company_id, 10),
          media: data?.job.media,
          job_category_id: data?.job.job_category_id,
          transport_location: data?.job.transport_location,
          transport_type: data?.job.transport_type,
          company_area: data?.job.company_area,
          job_type_id: data?.job.job_type_id,
          pick_up_state: data?.job.pick_up_state,
          timeslot_depots: data?.job.timeslot_depots,
          is_inbound_connect: data?.job.is_inbound_connect,
          is_hand_unloading: data?.job.is_hand_unloading,
          is_dangerous_goods: data?.job.is_dangerous_goods,
          is_tailgate_required: data?.job.is_tailgate_required,
          is_stackable_required: data?.job.is_stackable_required,
          is_paperwork_required: data?.job.is_paperwork_required,
          job_status_id: data?.job.job_status_id,
          base_notes: data?.job.base_notes,
          reference_no: data?.job.reference_no,
          b_reference_no: data?.job.b_reference_no,
        }));

        if (data?.job.company_area && companyRates.length > 0) {
          const matchingRate = companyRates.find(
            (rate) => rate.area === data.job.company_area,
          );
          if (matchingRate) {
            setSelectedRegion({
              area: matchingRate.area,
              cbm_rate: matchingRate.cbm_rate,
              minimum_charge: matchingRate.minimum_charge,
            });
          }
        }

        if (data.job.company_id) {
          getCompanyRates({
            variables: { company_id: String(data.job.company_id) },
          });
        }

        const selectedCategoryName = jobCategories.find(
          (job_category) => job_category.value == data.job.job_category_id,
        )?.label;
        const selectedStateCode =
          data.job.pick_up_state == "Victoria"
            ? "VIC"
            : data.job.pick_up_state == "Queensland"
              ? "QLD"
              : "";
        const selectedLocation = locationOptions.find(
          (location) => location.label == data.job.pick_up_state,
        );
        setRefinedData((prev) => ({
          ...prev,
          freight_type: selectedCategoryName || null,
          state_code: selectedLocation?.value || null,
          state: selectedLocation?.label || null,
        }));

        setFilteredDepotOptions(
          depotOptions.filter(
            (option) => option.state_code === selectedStateCode,
          ),
        );

        getCustomersByCompanyId({
          query: "",
          page: 1,
          first: 1000,
          orderByColumn: "id",
          orderByOrder: "ASC",
          company_id: data.job.company_id,
        });

        setJobDateAt(
          data.job.ready_at ? formatDate(data.job.ready_at) : jobDateAt,
        );
        setReadyAt(
          data.job.ready_at ? formatTimeUTCtoInput(data.job.ready_at) : readyAt,
        );
        setDropAt(
          data.job.drop_at ? formatTimeUTCtoInput(data.job.drop_at) : dropAt,
        );
        setIsSameDayJob(today === formatDate(data.job.ready_at));
        setIsTomorrowJob(
          new Date(formatDate(data.job.ready_at)).toDateString() ===
          new Date(
            new Date(today).setDate(new Date(today).getDate() + 1),
          ).toDateString(),
        );

        const _destinations =
          data.job.job_destinations?.filter((d: any) => !d.is_pickup) || [];

        setOriginalJobDestinations(_destinations);
        setJobDestinations(_destinations);

        setPickUpDestination((prev) => {
          const incoming = data.job.pick_up_destination;
          if (!incoming?.address && prev?.address) {
            return prev;
          }
          return (
            incoming || {
              ...defaultJobDestination,
              id: 0,
              is_new: true,
            }
          );
        });

        setOriginalJobItems(data.job.job_items || []);
        setJobItems(data.job.job_items || []);

        setJobCcEmails(data.job.job_cc_emails || []);
        setJobCcEmailTags(
          data.job.job_cc_emails?.map((e: { email: string }) => e.email) || [],
        );

        const { totalCBM, totalWeight } = calculateFinalWeightCBM(
          job.job_category_id,
          jobItems,
          companyWeight,
        );

        setQuoteCalculationRes((prev) => ({
          ...prev,
          total_weight: totalWeight,
          cbm_auto: totalCBM,
        }));
      } else {
        setJob((prev) => ({
          ...prev,
          media: data?.job.media,
        }));
        setJobCcEmails(data.job.job_cc_emails || []);
        setUpdatingMedia(false);
      }
    },

    onError(_error) {
    },
  });

  useEffect(() => {
    if (id) {
      getJob();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  console.log("setJobsetJob", job)

  const { data: _depotData } = useApolloQueryWithEffect(GET_ALL_TIMESLOT_DEPOTS, {
    context: { noAuthRedirect: true },
    onCompleted: (data: any) => {
      if (!isMounted.current) return;
      if (data?.allTimeslotDepots) {
        const depots = data.allTimeslotDepots
          .filter((depot: any) => depot.is_active)
          .map((depot: any) => ({
            value: depot.depot_name,
            label: depot.depot_name,
            price: depot.depot_price,
            state_code: depot.state_code,
            pincode: depot.pincode,
          }));
        setDepotOptions(depots);
      }
    },
    onError: (error) => {
      console.error("Error fetching depots:", error);
      if (!isMounted.current) return;
      toast({
        title: "Error fetching depots",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
  useEffect(() => {
    if (job.company_area && companyRates.length > 0) {
      const matchingRate = companyRates.find(
        (rate) => rate.area === job.company_area,
      );
      if (matchingRate) {
        setSelectedRegion({
          area: matchingRate.area,
          cbm_rate: matchingRate.cbm_rate,
          minimum_charge: matchingRate.minimum_charge,
        });
      }
    }
  }, [companyRates, job.company_area]);

  const companyQueryVariables = useMemo(
    () => ({ id: job?.company_id }),
    [job?.company_id],
  );

  const { loading: _companyLoading, data: _companyData } = useApolloQueryWithEffect(
    GET_COMPANY_QUERY,
    {
      variables: companyQueryVariables,
      skip: !job?.company_id,
      onCompleted: (data: any) => {
        if (data?.company?.weight_per_cubic != null) {
          setCompanyWeight(data.company.weight_per_cubic);
        }
        setCompanyToll(data.company?.toll_enabled ? 1 : 0);
      },
      onError(_error) { },
    },
  );

  useEffect(() => {
    if (jobData?.job) {
      setJob((prev) => ({
        ...prev,
        job_category_id: jobData.job.job_category_id,
        transport_location: jobData.job.transport_location,
        job_type_id: jobData.job.job_type_id,
      }));

      const selectedCategoryName = jobCategories.find(
        (job_category) => job_category.value == jobData.job.job_category_id,
      )?.label;

      const selectedLocation = locationOptions.find(
        (location) => location.value == jobData.job.transport_location,
      );

      const selectedCompany = companiesOptions.find(
        (company) => company.value == Number(jobData.job.company_id),
      );

      const tollEnabled = selectedCompany?.toll ?? false;

      setRefinedData((prev) => ({
        ...prev,
        toll_enabled: tollEnabled,
      }));
      setRefinedData((prev) => ({
        ...prev,
        freight_type: selectedCategoryName,
        state_code: jobData.job.transport_location,
        state: selectedLocation?.label || null,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobData, jobCategories, jobTypeOptions, companyRates]);

  const formatToSelect = (
    _entityArray: any[],
    valueKeyName: string,
    labelKeyName: string,
  ) => {
    return _entityArray.map((_entityItem) => {
      return {
        value: _entityItem[valueKeyName],
        label: _entityItem[labelKeyName],
        entity: _entityItem,
      };
    });
  };

  const [handleUpdateJob, { }] = useMutation(UPDATE_JOB_MUTATION, {
    variables: {
      input: {
        id: job.id,
        name: job.name,
        reference_no:
          job.b_reference_no?.trim() &&
            job.b_reference_no.toUpperCase().startsWith("B")
            ? job.b_reference_no
            : job.reference_no,
        b_reference_no: job.b_reference_no,
        booked_by: job.booked_by,
        company_area: job.company_area,
        notes: job.notes,
        job_category_id: job.job_category_id,
        job_status_id: job.job_status_id,
        job_type_id: job.job_type_id,
        decline_reason_id: job.decline_reason_id,
        driver_id: job.driver_id,
        region_id: job.region_id,
        customer_id: job.customer_id,
        company_id: job.company_id,
        start_at: job.start_at,
        ready_at: job.ready_at,
        drop_at: job.drop_at,
        completed_at: job.completed_at,
        pick_up_lng: job.pick_up_lng,
        pick_up_lat: job.pick_up_lat,
        pick_up_address: job.pick_up_address,
        pick_up_state: job.pick_up_state,
        pick_up_notes: job.pick_up_notes,
        pick_up_name: job.pick_up_name,
        pick_up_report: job.pick_up_report,
        delivery_name: job.delivery_name,
        delivery_report: job.delivery_report,
        customer_notes: job.customer_notes,
        base_notes: job.base_notes,
        admin_notes: job.admin_notes,
        decline_notes: job.decline_notes,
        minutes_waited: job.minutes_waited,
        is_inbound_connect: job.is_inbound_connect,
        is_hand_unloading: job.is_hand_unloading,
        is_dangerous_goods: job.is_dangerous_goods,
        is_tailgate_required: job.is_tailgate_required,
        is_stackable_required: job.is_stackable_required,
        is_paperwork_required: job.is_paperwork_required,
        timeslot: job.timeslot,
        timeslot_depots: job.timeslot_depots,
        last_free_at: job.last_free_at,
        quoted_price: job.quoted_price,
        transport_type: job.transport_type,
        transport_location: job.transport_location,
      },
    },
    onCompleted: async (data: any) => {
      for (let jobItem of jobItems) {
        if (jobItem.is_new) {
          handleCreateJobItem({
            input: {
              ...jobItem,
              job_id: parseInt(data.updateJob.id),
              is_new: undefined,
              dimension_height_cm: undefined,
              dimension_width_cm: undefined,
              dimension_depth_cm: undefined,
              volume_cm: undefined,
              id: undefined,
              item_type: undefined,
            },
          });
        } else {
          handleUpdateJobItem({
            variables: {
              input: {
                ...jobItem,
                item_type: undefined,
                is_new: undefined,
                dimension_height_cm: undefined,
                dimension_width_cm: undefined,
                dimension_depth_cm: undefined,
                volume_cm: undefined,
              },
            },
          });
        }
      }
      originalJobItems.forEach((originalJobItem) => {
        if (
          !jobItems.find((jobItem) => {
            return jobItem.id == originalJobItem.id;
          })
        ) {
          handleDeleteJobItem({
            variables: {
              id: parseInt(originalJobItem.id),
            },
          });
        }
      });
      let _jobDestinations = [...jobDestinations];
      for (let jobDestination of _jobDestinations) {
        if (jobDestination.is_new) {
          await handleCreateJobDestination({
            input: {
              ...jobDestination,
              job_id: parseInt(data.updateJob.id),
              id: undefined,
              is_new: undefined,
              customer_id: undefined,
              label: undefined,
              is_pickup: false,
              updated_at: undefined,
              route_point: undefined,
              issue_reports: undefined,
              media: undefined,
            },
          });
        } else {
          handleUpdateJobDestination({
            variables: {
              input: {
                ...jobDestination,
                route_point: undefined,
                customer_id: undefined,
                label: undefined,
                updated_at: undefined,
                is_pickup: false,
                issue_reports: undefined,
                media: undefined,
                is_new: undefined,
              },
            },
          });
        }
      }
      originalJobDestinations.forEach((originalJobDestination) => {
        if (
          !jobDestinations.find((jobDestination) => {
            return jobDestination.id == originalJobDestination.id;
          })
        ) {
          handleDeleteJobDestination({
            variables: {
              id: parseInt(originalJobDestination.id),
            },
          });
        }
      });

      handleUpdateJobDestination({
        variables: {
          input: {
            ...pickUpDestination,
            route_point: undefined,
            label: undefined,
            is_pickup: true,
            updated_at: undefined,
            issue_reports: undefined,
            media: undefined,
            is_new: undefined,
          },
        },
      });
      await getJob();
      setIsSaving(false);

      toast({
        title: "Job updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      setIsSaving(false);
      showGraphQLErrorToast(error);
    },
  });

  const [handleDeleteJob, { }] = useMutation(DELETE_JOB_MUTATION, {
    variables: {
      id: id,
    },
    onCompleted: (_data) => {
      toast({
        title: "Job deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/admin/jobs");
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const staticListQueryVariables = useMemo(
    () => ({
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    }),
    [],
  );

  useApolloQueryWithEffect(GET_JOB_CATEGORIES_QUERY, {
    variables: staticListQueryVariables,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: any) => {
      if (!isMounted.current) return;
      const options = data.jobCategorys.data.map((item: any) => ({
        value: parseInt(item.id),
        label: item.name,
      }));
      setJobCategories(options);
    },
  });
  useApolloQueryWithEffect(GET_JOB_STATUSES_QUERY, {
    variables: staticListQueryVariables,
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      if (!isMounted.current) return;
      const options = data.jobStatuses.data.map((jobStatus: any) => ({
        value: parseInt(jobStatus.id),
        label: jobStatus.name,
      }));
      setJobStatuses(options);
    },
  });

  const driversQueryVariables = useMemo(
    () => ({
      query: debouncedSearchDriver,
      page: 1,
      first: 10000,
      orderByColumn: "id",
      orderByOrder: "ASC",
    }),
    [debouncedSearchDriver],
  );

  useApolloQueryWithEffect(GET_DRIVERS_QUERY, {
    variables: driversQueryVariables,
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      if (!isMounted.current) return;
      const options = data.drivers.data.map((driver: any) => ({
        value: parseInt(driver.id),
        label: driver.full_name,
      }));
      setDrivers(options);
    },
  });

  useApolloQueryWithEffect(GET_JOB_TYPES_QUERY, {
    variables: staticListQueryVariables,
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      if (!isMounted.current) return;
      setJobTypeOptions(
        data.jobTypes?.data.map((jobType: any) => ({
          label: jobType.name,
          value: jobType.id,
        })),
      );
    },
  });

  const jobPriceCalcVariables = useMemo(
    () => ({ job_id: Number(job.id) }),
    [job.id],
  );

  useApolloQueryWithEffect(GET_JOB_PRICE_CALCULATION_DETAIL_QUERY, {
    variables: jobPriceCalcVariables,
    fetchPolicy: "network-only",
    skip: !job.id || !Boolean(job.id),
    onCompleted: async (data: any) => {
      if (!isMounted.current) return;
      if (data.jobPriceCalculationDetail) {
        setIsUpdateMode(true);
        setPricecalculationid(data.jobPriceCalculationDetail.id);
        setRefinedData({
          ...data.jobPriceCalculationDetail,
          tail_lift: data.jobPriceCalculationDetail?.tail_lift,
          cbm_auto: data.jobPriceCalculationDetail?.cbm_auto,
          customer_id: data.jobPriceCalculationDetail?.customer_id,
          dangerous_goods: data.jobPriceCalculationDetail?.dangerous_goods,
          freight: data.jobPriceCalculationDetail?.freight,
          fuel: data.jobPriceCalculationDetail?.fuel,
          time_slot: data.jobPriceCalculationDetail?.time_slot,
          toll_applied: data.jobPriceCalculationDetail?.toll_applied,
          toll_type: data.jobPriceCalculationDetail?.toll_type,
          toll_amount: data.jobPriceCalculationDetail?.toll_amount,
          hand_unload: data.jobPriceCalculationDetail?.hand_unload,
          stackable: data.jobPriceCalculationDetail?.stackable,
          total_price: data.jobPriceCalculationDetail?.total,
          total_weight: data.jobPriceCalculationDetail?.total_weight,
          timeslot_depots: job?.timeslot_depots,
          toll_levy_type: data.jobPriceCalculationDetail?.toll_levy_type,
        });
        setQuoteCalculationRes((prev) => ({
          ...prev,
          total_price: data.jobPriceCalculationDetail?.total,
          total: data.jobPriceCalculationDetail?.total,
          tail_lift: data.jobPriceCalculationDetail?.tail_lift,
          total_weight:
            data.jobPriceCalculationDetail.total_weight !== undefined
              ? data.jobPriceCalculationDetail.total_weight
              : prev.total_weight,
          cbm_auto:
            data.jobPriceCalculationDetail.cbm_auto !== undefined
              ? data.jobPriceCalculationDetail.cbm_auto
              : prev.cbm_auto,
          customer_id: data.jobPriceCalculationDetail?.customer_id,
          dangerous_goods: data.jobPriceCalculationDetail?.dangerous_goods,
          freight: data.jobPriceCalculationDetail?.freight,
          fuel: data.jobPriceCalculationDetail?.fuel,
          hand_unload: data.jobPriceCalculationDetail?.hand_unload,
          stackable: data.jobPriceCalculationDetail.stackable,
          time_slot: data.jobPriceCalculationDetail?.time_slot,
          toll_applied: data.jobPriceCalculationDetail?.toll_applied,
          toll_type: data.jobPriceCalculationDetail?.toll_type,
          toll_amount: data.jobPriceCalculationDetail?.toll_amount,
          toll_levy_type: data.jobPriceCalculationDetail?.toll_levy_type,
        }));
        setButtonText("Update Quote");
      }
      const { totalCBM, totalWeight } = calculateFinalWeightCBM(
        job.job_category_id,
        jobItems,
        companyWeight,
      );
      setQuoteCalculationRes((prev) => ({
        ...prev,
        total_weight: totalWeight,
        cbm_auto: totalCBM,
      }));
      getJob();
    },
    onError: (error) => {
      setIsUpdateMode(false);
      setRefinedData(defaultJobQuoteData);
      setQuoteCalculationRes(defaultJobPriceCalculationDetail);

      const { totalCBM, totalWeight } = calculateFinalWeightCBM(
        job.job_category_id,
        jobItems,
        companyWeight,
      );
      setQuoteCalculationRes((prev) => ({
        ...prev,
        total_weight: totalWeight,
        cbm_auto: totalCBM,
      }));
      setButtonText("Get A Quote");
      if (error.message.includes("No record found")) {
        console.warn(
          "No quote calculation detail yet for this job — skipping.",
        );
      } else {
        console.error("Error fetching job price calculation detail:", error);
        showGraphQLErrorToast(error);
      }
    },
  });
  useApolloQueryWithEffect(GET_ITEM_TYPES_QUERY, {
    variables: staticListQueryVariables,
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      const itemTypesArray = data.itemTypes.data.map(
        (_entity: { id: string; name: string }) => ({
          value: parseInt(_entity.id),
          label: _entity.name,
        }),
      );

      const sortedItemTypes = itemTypesArray.sort(
        (
          a: { value: number; label: string },
          b: { value: number; label: string },
        ) => {
          if (a.label === "Other") return 1;
          if (b.label === "Other") return -1;
          return 0;
        },
      );

      setItemTypes(sortedItemTypes);
    },
  });

  const companysQueryVariables = useMemo(
    () => ({
      query: debouncedSearch,
      page: 1,
      first: 10000,
      orderByColumn: "id",
      orderByOrder: "ASC",
    }),
    [debouncedSearch],
  );

  useApolloQueryWithEffect(GET_COMPANYS_QUERY, {
    variables: companysQueryVariables,
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      const newCompaniesOptions = data.companys.data.map((_entity: any) => ({
        value: parseInt(_entity.id),
        label: _entity.name,
        toll: _entity.toll_enabled,
      }));

      setCompaniesOptions(newCompaniesOptions);
    },
  });

  const [getCompanyRates, { data: _companyRatesData }] = useApolloLazyQueryWithEffect(
    GET_COMPANY_RATE_QUERY,
    {
      fetchPolicy: "network-only",
      onCompleted: (data: any) => {
        if (!isMounted.current) return;
        if (data?.getRatesByCompany) {
          const rates = [...data.getRatesByCompany];
          setCompanyRates(rates);
          setRefinedData((prevData) => ({
            ...prevData,
            company_rates: rates,
          }));
        }
      },
      onError: (error) => {
        console.error("Company rates error:", error);
        if (!error.message.includes("No record found")) {
          showGraphQLErrorToast(error);
        }
      },
    },
  );
  useEffect(() => {
    if (job?.company_id && job.company_id !== 0) {
      getCompanyRates({ variables: { company_id: String(job.company_id) } });
    }
  }, [job.company_id, getCompanyRates]);

  useEffect(() => {
    if (!jobItems || jobItems.length === 0) return;

    const calculateTotals = () => {
      const { totalCBM, totalWeight } = calculateFinalWeightCBM(
        job.job_category_id,
        jobItems,
        companyWeight,
      );

      setQuoteCalculationRes((prev) => ({
        ...prev,
        total_weight: totalWeight,
        cbm_auto: totalCBM,
      }));
    };

    calculateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyWeight, job.job_category_id, jobItems]);

  const handleRemoveFromJobItems = (index: number) => {
    let _jobItems = [...jobItems];
    _jobItems.splice(index, 1);
    setJobItems(_jobItems);
    const { totalCBM, totalWeight } = calculateFinalWeightCBM(
      job.job_category_id,
      jobItems,
      companyWeight,
    );
    setQuoteCalculationRes((prev) => ({
      ...prev,
      total_weight: totalWeight,
      cbm_auto: totalCBM,
    }));
  };
  const handleJobItemChanged = (
    value: any,
    index: number,
    fieldToUpdate?: string,
  ) => {
    let _jobItems = [...jobItems];
    if (!value.dimension_height_cm) {
      value.dimension_height_cm = (
        parseFloat(value.dimension_height) * 100
      ).toFixed(2);
    }
    if (!value.dimension_width_cm) {
      value.dimension_width_cm = (
        parseFloat(value.dimension_width) * 100
      ).toFixed(2);
    }
    if (!value.dimension_depth_cm) {
      value.dimension_depth_cm = (
        parseFloat(value.dimension_depth) * 100
      ).toFixed(2);
    }
    if (fieldToUpdate == "volume") {
      value.volume =
        value.dimension_height *
        value.dimension_width *
        value.dimension_depth *
        value.quantity;
      value.volume_cm = (value.volume * 100).toFixed(2);
    }
    _jobItems[index] = value;
    setJobItems(_jobItems);
    setPrevJobState((prevState) => ({
      ...prevState,
      job_items: _jobItems,
    }));
  };
  const addToJobItems = () => {
    let nextId = 1;
    if (jobItems.length > 0) {
      nextId = jobItems[jobItems.length - 1].id + 1;
    }
    setJobItems((jobItems) => [
      ...jobItems,
      { ...defaultJobItem, ...{ id: nextId, is_new: true } },
    ]);
  };

  useEffect(() => {
    dateChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobDateAt, readyAt, dropAt]);
  const dateChanged = () => {
    try {
      setJob((prev) => ({
        ...prev,
        ready_at: formatDateTimeToDB(jobDateAt, readyAt),
        drop_at: formatDateTimeToDB(jobDateAt, dropAt),
      }));
    } catch (e) {
    }
  };
  const addToJobDestinations = () => {
    let nextId = jobDestinations[jobDestinations.length - 1]
      ? jobDestinations[jobDestinations.length - 1].id + 1
      : 1;
    setJobDestinations((jobDestinations) => [
      ...jobDestinations,
      { ...defaultJobDestination, ...{ id: nextId, is_new: true } },
    ]);
  };
  const handleRemoveFromJobDestinations = (index: number) => {
    let _jobDestinations = [...jobDestinations];
    _jobDestinations.splice(index, 1);
    setJobDestinations(_jobDestinations);
  };
  const handleJobDestinationChanged = async (value: any, index: number) => {
    let _jobDestinations = [...jobDestinations];
    _jobDestinations[index] = value;
    setJobDestinations(_jobDestinations);
  };
  const [handleDeleteJobItem, { }] = useMutation(DELETE_JOB_ITEM_MUTATION, {
    onCompleted: (_data) => { },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });
  const [handleDeleteJobDestination, { }] = useMutation(
    DELETE_JOB_DESTINATION_MUTATION,
    {
      onCompleted: (_data) => { },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  const handleCreateJobItem = (jobItem: any) => {
    return new Promise((resolve, reject) => {
      createJobItem({ variables: jobItem })
        .then(({ data }) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
          showGraphQLErrorToast(error);
        });
    });
  };
  const [createJobItem] = useMutation(CREATE_JOB_ITEM_MUTATION);
  const handleCreateJobDestination = (jobDestination: any) => {
    return new Promise((resolve, reject) => {
      createJobDestination({ variables: jobDestination })
        .then(({ data }) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
          showGraphQLErrorToast(error);
        });
    });
  };
  const [createJobDestination] = useMutation(CREATE_JOB_DESTINATION_MUTATION);
  const [handleUpdateJobItem, { }] = useMutation(UPDATE_JOB_ITEM_MUTATION, {
    onCompleted: (_data) => {
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });
  const [handleUpdateJobDestination, { }] = useMutation(
    UPDATE_JOB_DESTINATION_MUTATION,
    {
      onCompleted: (_data) => {
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );
  const [handleDeleteMedia, { }] = useMutation(DELETE_MEDIA_MUTATION, {
    onCompleted: (_data) => {
      toast({
        title: "Attachment deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      getJob();
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const customersQueryVariables = useMemo(
    () => ({
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
      company_id: job.company_id,
    }),
    [job.company_id],
  );

  const { refetch: getCustomersByCompanyId } = useApolloQueryWithEffect(GET_CUSTOMERS_QUERY, {
    variables: customersQueryVariables,
    skip: !job.company_id,
    onCompleted: (data: any) => {
      setCustomerOptions(
        formatToSelect(data.customers.data, "id", "full_name"),
      );
    },
  });

  const customerAddressesQueryVariables = useMemo(
    () => ({
      query: "",
      page: 1,
      first: 200,
      orderByColumn: "id",
      orderByOrder: "ASC",
      customer_id: job.customer_id,
    }),
    [job.customer_id],
  );

  const { refetch: getCustomerAddresses } = useApolloQueryWithEffect(
    GET_CUSTOMER_ADDRESSES_QUERY,
    {
      variables: customerAddressesQueryVariables,
      onCompleted: (data: any) => {
        setSavedAddressesSelect(
          formatToSelect(
            data.customerAddresses.data,
            "id",
            "address_business_name",
          ),
        );
      },
    },
  );

  const handleJobCcEmailsChange = useCallback(
    (_event: SyntheticEvent, jobCcEmailTags: string[]) => {
      setJobCcEmailTags(
        jobCcEmailTags.filter((email) => {
          return re.test(email);
        }),
      );
    },
    [re],
  );
  const [handleCreateJobCcEmail, { }] = useMutation(
    CREATE_JOB_CC_EMAIL_MUTATION,
    {
      variables: {
        input: {
          job_id: job.id,
          email: createdCcEmail,
        },
      },
      onCompleted: (_data) => {
        toast({
          title: "Additional email notification created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        getJob();
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );
  const handleJobCcEmailAdd = useCallback(
    (_event: SyntheticEvent, email: string) => {
      if (re.test(email)) {
        setCreatedCcEmail(email);
        setTimeout(() => {
          handleCreateJobCcEmail();
        }, 500);
      } else {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [handleCreateJobCcEmail, re, toast],
  );

  const handleJobCcEmailRemove = useCallback(
    (_event: SyntheticEvent, index: number) => {
      setDeleteJobCcEmailId(jobCcEmails[index]["id"]);
      setJobCcEmails(jobCcEmails.filter((_, i) => i !== index));
      setJobCcEmailTags(jobCcEmailTags.filter((_, i) => i !== index));

      setTimeout(() => {
        handleDeleteJobCcEmail();
      }, 500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobCcEmailTags, jobCcEmails],
  );

  const [handleDeleteJobCcEmail, { }] = useMutation(
    DELETE_JOB_CC_EMAIL_MUTATION,
    {
      variables: {
        id: deleteJobCcEmailId,
      },
      onCompleted: (_data) => { },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  useEffect(() => {
    if (job.customer_id && customerOptions.length > 0) {
      setCustomerSelected({
        ...customerOptions.find((_e) => _e.value == job.customer_id)?.entity,
      });
      getCustomerAddresses();
    }
    if (job.customer_id == null) {
      setCustomerSelected(defaultCustomer);
      setSavedAddressesSelect([]);
    }
  }, [job.customer_id, customerOptions, getCustomerAddresses]);

  const handleCreateJobPriceCalculationDetail = (
    jobPriceDetail: CreateJobPriceCalculationDetailInput,
  ) => {
    return new Promise((resolve, reject) => {
      createJobPriceCalculationDetail({ variables: { input: jobPriceDetail } })
        .then(({ data }) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
          showGraphQLErrorToast(error);
        });
    });
  };

  const [createJobPriceCalculationDetail] = useMutation(
    CREATE_JOB_PRICE_CALCULATION_DETAIL_MUTATION,
  );

  const handleUpdateJobPriceCalculationDetail = (quoteCalculationRes: any) => {
    return new Promise((resolve, reject) => {
      updateJobPriceCalculationDetail({
        variables: {
          job_id: Number(job.id),
          input: {
            customer_id: Number(job.customer_id),
            cbm_auto: Number(quoteCalculationRes.cbm_auto),
            total_weight: Number(quoteCalculationRes.total_weight),
            freight: Number(quoteCalculationRes.freight),
            fuel: Number(quoteCalculationRes.fuel),
            hand_unload: Number(quoteCalculationRes.hand_unload),
            dangerous_goods: Number(quoteCalculationRes.dangerous_goods),
            time_slot: Number(quoteCalculationRes.time_slot),
            tail_lift: Number(quoteCalculationRes.tail_lift),
            stackable: Number(quoteCalculationRes.stackable),
            toll_amount: Number(quoteCalculationRes.toll_amount),
            toll_applied: Boolean(quoteCalculationRes.toll_applied),
            toll_type: quoteCalculationRes.toll_type,
            total: Number(quoteCalculationRes.total),
          },
        },
      })
        .then(({ data }) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
          showGraphQLErrorToast(error);
        });
    });
  };

  const [updateJobPriceCalculationDetail] = useMutation(
    UPDATE_JOB_PRICE_CALCULATION_DETAIL_MUTATION,
  );

  const validateAddresses = () => {
    if (!pickUpDestination?.address) {
      toast({
        title: "Pickup address is required.",
        description: "Please enter the address in the correct format.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (jobDestinations.some((destination) => !destination.address)) {
      toast({
        title: "Delivery address is required.",
        description:
          "Please ensure all delivery addresses are properly entered.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const [handleCalculateSeaFreight] = useApolloLazyQueryWithEffect(
    CALCULATE_SEA_FREIGHT_QUERY,
    {
      fetchPolicy: "no-cache",
      onCompleted: (data: any) => {
        setQuoteCalculationRes((prev) => ({
          ...prev,
          ...data.calculateSeaFreight,
        }));
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );
  const sendFreightData = async () => {
    if (!validateAddresses()) return;
    setButtonText("Get A Quote");

    const jobDestination1 =
      jobDestinations.length > 0
        ? {
          state: jobDestinations[0]?.address_state,
          suburb: jobDestinations[0]?.address_city,
          postcode: jobDestinations[0]?.address_postal_code,
          address: jobDestinations[0]?.address,
        }
        : null;

    const _selectedCategoryName = jobCategories.find(
      (job_category) => job_category.value == job?.job_category_id,
    )?.label;

    const selectedstate = locationOptions.find(
      (location) =>
        location.label?.toLowerCase() == job?.pick_up_state?.toLowerCase(),
    );

    const _selectedDepot = depotOptions.find(
      (depot) => depot.value === job.timeslot_depots,
    )?.label;
    const filteredCompanyRates = companyRates?.filter(
      (rate) => rate.state === jobDestination1?.state,
    );

    const { totalCBM, totalWeight } = calculateFinalWeightCBM(
      job.job_category_id,
      jobItems,
      companyWeight,
    );
    let selectedServiceChoice = jobTypeOptions.find(
      (job_type) => job_type.value == job.job_type_id,
    )?.label;
    const finalCBM = parseFloat(totalCBM.toFixed(2));
    const finalWeight = parseFloat(totalWeight.toFixed(2));
    try {
      const response = await handleCalculateSeaFreight({
        variables: {
          input: {
            company_id: Number(job.company_id),
            transport_type: job.transport_type,
            state:
              refinedData.state ||
              job.pick_up_state ||
              pickUpDestination.address_state,
            state_code: refinedData.state_code || refinedData.pick_up_stateCode,
            service_choice: selectedServiceChoice,
            company_rates:
              ((job.job_category_id == 1 || job.job_category_id == 2) &&
                selectedstate?.value === "QLD") ||
                selectedstate?.value === "VIC"
                ? filteredCompanyRates?.map((rate) => ({
                  company_id: rate.company_id,
                  seafreight_id: rate.seafreight_id,
                  area: rate.area,
                  cbm_rate: rate.cbm_rate,
                  minimum_charge: rate.minimum_charge,
                }))
                : [],
            toll_enabled: companyToll === 1 ? true : false,
            job_pickup_address: {
              suburb: pickUpDestination?.address_city,
              postcode: pickUpDestination?.address_postal_code,
              state: pickUpDestination?.address_state,
            },

            freight_type: refinedData.freight_type || _selectedCategoryName,

            pickup_time: {
              ready_by: readyAt,
            },
            delivery_time: {
              drop_by: dropAt,
            },

            ready_by: readyAt,
            drop_by: dropAt,

            job_destination_address:
              jobDestinations.length > 0
                ? {
                  suburb: jobDestinations[0]?.address_city,
                  postcode: jobDestinations[0]?.address_postal_code,
                  state: jobDestinations[0]?.address_state,
                }
                : null,

            job_items: jobItems.map((item) => ({
              id: item.id,
              name: item.name || "",
              quantity: item.quantity,
              volume: item.volume,
              weight: item.weight,
              dimension_height: item.dimension_height,
              dimension_width: item.dimension_width,
              dimension_depth: item.dimension_depth,
            })),

            surcharges: {
              hand_unload: job.is_hand_unloading || false,
              dangerous_goods: job.is_dangerous_goods || false,
              time_slot: job.is_inbound_connect || false,
              timeslot_depots: job.is_inbound_connect
                ? job.timeslot_depots ||
                _selectedDepot ||
                refinedData.timeslot_depots
                : [],
              tail_lift: job.is_tailgate_required || false,
              stackable: false,
            },
            total_weight: finalWeight,
            total_cbm: finalCBM,
          },
        },
      });
      const calculationData = response?.data?.calculateSeaFreight;

      if (!calculationData) {
        throw new Error("No calculation data received from API");
      }

      setQuoteCalculationRes({
        ...quoteCalculationRes,
        cbm_auto: Number(finalCBM ?? 0),
        total_weight: Number(finalWeight ?? 0),
        freight: Number(calculationData?.freight ?? 0),
        fuel: Number(calculationData?.fuel ?? 0),
        hand_unload: Number(calculationData?.hand_unload ?? 0),
        dangerous_goods: Number(calculationData?.dangerous_goods ?? 0),
        time_slot: Number(calculationData?.time_slot ?? 0),
        tail_lift: Number(calculationData?.tail_lift ?? 0),
        stackable: Number(calculationData?.stackable ?? 0),
        toll_amount: Number(calculationData?.toll_amount ?? 0),
        toll_type: calculationData?.toll_type ?? null,
        toll_applied: Boolean(calculationData?.toll_applied ?? false),
        total: Number(calculationData?.total ?? 0),
        toll_levy_type: calculationData?.toll_levy_type ?? null,
      });
      toast({ title: "Quote Calculation Success", status: "success" });
      if (isUpdateMode) {
        await handleUpdateJobPriceCalculationDetail(calculationData)
          .then((_data) => {
            handleUpdateJob();
            toast({
              title: "Quote price updated",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          })
          .catch((error) => {
            console.error("Error updating job price:", error);
          });
      } else {
        const calculationData = response.data as {
          cbm_auto: number;
          total_weight: number;
          freight: number;
          fuel: number;
          hand_unload: number;
          dangerous_goods: number;
          time_slot: number;
          tail_lift: number;
          stackable: number;
          total: number;
          toll_applied: boolean;
          toll_type: string | null;
          toll_amount: number;
          fuel_levy_percentage: number;
          toll_levy_percentage: number;
          fuel_levy_amount: number;
          toll_levy_amount: number;
          toll_levy_type: string | null;
        };

        await handleCreateJobPriceCalculationDetail({
          job_id: Number(job.id),
          customer_id: Number(job.customer_id),
          cbm_auto: Number(calculationData.cbm_auto),
          total_weight: Number(calculationData.total_weight),
          freight: Number(calculationData.freight),
          fuel: Number(calculationData.fuel),
          hand_unload: Number(calculationData.hand_unload),
          dangerous_goods: Number(calculationData.dangerous_goods),
          time_slot: Number(calculationData.time_slot),
          tail_lift: Number(calculationData.tail_lift),
          stackable: Number(calculationData.stackable),
          total: Number(calculationData.total),
          toll_applied: calculationData.toll_applied,
          toll_type: calculationData.toll_type,
          toll_amount: calculationData.toll_amount,
          fuel_levy_percentage: calculationData.fuel_levy_percentage,
          toll_levy_percentage: calculationData.toll_levy_percentage,
          fuel_levy_amount: calculationData.fuel_levy_amount,
          toll_levy_amount: calculationData.toll_levy_amount,
          toll_levy_type: calculationData.toll_levy_type
        })
          .then((_data) => {
            handleUpdateJob();
            toast({
              title: "Quote price created",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          })
          .catch((error) => {
            console.error("Error creating job price:", error);
          });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadPDFapiUrl = process.env.NEXT_PUBLIC_PRICE_BREAKDOWN_API_URL;

  const downloadQuotePdf = async () => {
    if (!validateAddresses()) return;
    if (!validateTimeslotDepot()) return;
    if (
      job.job_type_id === null ||
      job.job_type_id === undefined ||
      refinedData.service_choice === ""
    ) {
      toast({
        title: "Job Type Required",
        description: "Please select the available job type once again.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (
      (job.job_category_id == 1 || job.job_category_id == 2) &&
      (!job.transport_type || job.transport_type === "")
    ) {
      toast({
        title: "Transport Type Required",
        description: "Please select Import or Export as the transport type.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsDownloading(true);

    const jobDestination1 =
      jobDestinations.length > 0
        ? {
          state: jobDestinations[0]?.address_state,
          suburb: jobDestinations[0]?.address_city,
          postcode: jobDestinations[0]?.address_postal_code,
          address: jobDestinations[0]?.address,
        }
        : null;

    const filteredCompanyRates = companyRates?.filter(
      (rate) => rate.state === jobDestination1?.state,
    );
    const selectedstate = locationOptions.find(
      (location) =>
        location.label?.toLowerCase() == job?.pick_up_state?.toLowerCase(),
    );
    const selectedDepot = depotOptions.find(
      (depot) => depot.value === job.timeslot_depots,
    )?.label;

    const selectedServiceChoice = jobTypeOptions.find(
      (job_type) => job_type.value == job.job_type_id,
    )?.label;
    const payload = {
      pickup: {
        state: pickUpDestination?.address_state,
        suburb: pickUpDestination?.address_city,
        postcode: pickUpDestination?.address_postal_code,
        address: pickUpDestination?.address,
      },

      destination: jobDestination1
        ? {
          state: jobDestination1.state,
          suburb: jobDestination1.suburb,
          postcode: jobDestination1.postcode,
          address: jobDestination1.address,
        }
        : {},

      items: jobItems.map((item) => ({
        id: item.id,
        name: item.name || "",
        quantity: item.quantity,
        volume: item.volume,
        weight: item.weight,
        dimension_height: item.dimension_height,
        dimension_depth: item.dimension_depth,
        dimension_width: item.dimension_width,
      })),

      transport_type: job.transport_type,
      service_choice: selectedServiceChoice,
      state:
        refinedData.state ||
        job.pick_up_state ||
        pickUpDestination?.address_state,
      state_code: refinedData.state_code || selectedstate?.value,
      ready_by: readyAt,
      drop_by: dropAt,
      freight_type: refinedData.freight_type,

      company_rates:
        ((job.job_category_id == 1 || job.job_category_id == 2) &&
          selectedstate?.value === "QLD") ||
          selectedstate?.value === "VIC"
          ? filteredCompanyRates.map((rate) => ({
            company_id: rate.company_id,
            seafreight_id: rate.seafreight_id,
            area: rate.area,
            cbm_rate: rate.cbm_rate,
            state: rate.state,
            minimum_charge: rate.minimum_charge,
          }))
          : [],

      surcharges: {
        hand_unload: job.is_hand_unloading || false,
        dangerous_goods: job.is_dangerous_goods || false,
        time_slot: job.is_inbound_connect || false,
        timeslot_depots: job.is_inbound_connect
          ? job.timeslot_depots || selectedDepot
          : "",
        tail_lift: job.is_tailgate_required || false,
        stackable: true,
      },
    };

    try {
      const response = await axios.post(downloadPDFapiUrl, payload, {
        headers: { "Content-Type": "application/json" },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Quote_Price_Breakdown.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Download started",
        description: "Your quote PDF is being downloaded.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading quote PDF:", error);
      toast({
        title: "Download failed",
        description: "Unable to download the quote PDF. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const validateTimeslotDepot = () => {
    if (
      job.is_inbound_connect &&
      (job.job_category_id == 1 || job.job_category_id == 2) &&
      (!job.timeslot_depots ||
        job.timeslot_depots == null ||
        job.timeslot_depots === "")
    ) {
      toast({
        title: "Timeslot depot required",
        description:
          "Please select a timeslot depot when Inbound Connect is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const handleSaveJobPriceCalculation = () => {
    if (!validateTimeslotDepot()) return;
    const hasChanged =
      prevJobState.freight_type !== refinedData.freight_type ||
      prevJobState.transport_type !== job.transport_type ||
      prevJobState.transport_location !== job.transport_location ||
      prevJobState.job_items.some(
        (item, index) =>
          item.id !== jobItems[index].id ||
          item.name !== jobItems[index].name ||
          item.notes !== jobItems[index].notes ||
          item.quantity !== jobItems[index].quantity ||
          item.volume !== jobItems[index].volume ||
          item.weight !== jobItems[index].weight ||
          item.dimension_height !== jobItems[index].dimension_height ||
          item.dimension_width !== jobItems[index].dimension_width ||
          item.dimension_depth !== jobItems[index].dimension_depth,
      );
    if (isUpdateMode) {
      if (hasChanged) {
        setButtonText("Quote");
        sendFreightData();
      } else {
        toast({
          title: "No changes detected",
          description: "No changes detected, no need to update.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      setButtonText("Quote");
      sendFreightData();
    }
  };

  const handleUpdateJobWithValidation = () => {
    if (!validateTimeslotDepot()) {
      setIsSaving(false);
      return;
    }
    handleUpdateJob();
  };

  const handleTabChange = useCallback(
    async (nextTabId: number) => {
      if (nextTabId === tabId) return;

      setActiveTab(nextTabId);

      const needsRefresh =
        nextTabId === 2 || nextTabId === 3 || nextTabId === 4;
      if (!needsRefresh) return;

      if (refetchingRef.current) return;
      refetchingRef.current = true;

      try {
        const { data } = await getJob();
        if (data?.job) {
          setReportJob((prev) => ({ ...prev, ...data.job }));
        }
      } catch (e) {
        console.error("Refetch failed:", e);
        toast({
          title: "Couldn’t refresh data",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        refetchingRef.current = false;
      }
    },
    [tabId, getJob, toast],
  );
  const handlePreviewEmail = async (reason: string) => {
    setSelectedReason(reason);
    try {
      const { data }: any = await getEmailTemplate({
        variables: {
          id: job.id,
          reason,
          extra_details: "",
        },
      });

      if (data?.getJobEmailTemplate) {
        setSubject(data.getJobEmailTemplate.subject || "");
        setBody(data.getJobEmailTemplate.body || "");
        onOpen();
      } else {
        toast({
          title: "No email content found",
          description: "The backend did not return a template.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching email template",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleSendEmail = async () => {
    if (!selectedReason) {
      toast({
        title: "No reason selected",
        description: "Please select a reason from the Send Email dropdown.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsEmailSending(true);
    try {
      console.log("Sending email with:", {
        id: job.id,
        reason: selectedReason,
        extra_details: "",
      });
      const res: any = await sendJobEmail({
        variables: {
          id: job.id,
          reason: selectedReason,
          extra_details: "",
          subject: subject,
          body: body,
        },
      });
      if (res.data.sendJobEmail.success) {
        toast({
          title: "Email sent successfully",
          description: res.data.sendJobEmail.message,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Email sending failed",
          description: res.data.sendJobEmail.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error sending email",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleBTypeReferenceChange = (e) => {
    const { name, value } = e.target;

    if (value === "") {
      setJob((prev) => ({
        ...prev,
        [name]: "",
      }));
      return;
    }

    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);

    if (formattedValue[0] !== "B") {
      toast({
        title:
          "B Type Reference Number should start with 'B'. Otherwise, use the Reference field above.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setJob((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  return (
    <>
      <Box
        className="mk-customers-id overflow-auto"
        pt={{ base: "130px", md: "97px", xl: "97px" }}
        backgroundColor="white"
      >
        { }
        <Grid
          pr="24px"
          className="mk-mainInner"
          h={{
            base: "calc(100vh - 130px)",
            md: "calc(100vh - 97px)",
            xl: "calc(100vh - 97px)",
          }}
        >
          {!jobLoading && (
            <Grid pl="6" backgroundColor="white">
              <FormControl>
                <Flex justify="space-between" align="center" className="my-8">
                  <h1 className="">Delivery #{job.id}</h1>

                  <Flex alignItems="center">
                    {job.quote?.id && (
                      <Button
                        hidden={!isAdminUser}
                        variant="primary"
                        isDisabled={isSaving}
                        onClick={() => {
                          router.push("/admin/quotes/" + job.quote?.id);
                        }}
                        mr="2"
                      >
                        View Quote
                      </Button>
                    )}
                    {isAdminUser && (
                      <Menu>
                        <MenuButton
                          as={Button}
                          variant="primary"
                          isDisabled={isEmailSending}
                          mr="2"
                        >
                          {isEmailSending ? "Sending Email..." : "Send Email"}
                        </MenuButton>
                        <MenuList>
                          {emailReasons.map((reason) => (
                            <MenuItem
                              key={reason}
                              onClick={() => handlePreviewEmail(reason)}
                            >
                              {reason}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>
                    )}
                    <Button
                      hidden={!isAdminUser}
                      variant="primary"
                      isDisabled={isSaving}
                      onClick={() => {
                        setIsSaving(true);
                        handleUpdateJobWithValidation();
                      }}
                    >
                      {isSaving ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </Flex>
                </Flex>

                { }

                <TabsComponent
                  tabs={tabs}
                  onChange={handleTabChange}

                />

                { }
                {tabId == 1 && (
                  <JobDetailsTab
                    isAdmin={isAdminUser}
                    job={job}
                    setJob={setJob}
                    deleteReason={deleteReason}
                    setDeleteReason={setDeleteReason}
                    jobStatuses={jobStatuses}
                    jobCategories={jobCategories}
                    depotOptions={depotOptions}
                    _setDepotOptions={setDepotOptions}
                    drivers={drivers}
                    companiesOptions={companiesOptions}
                    customerOptions={customerOptions}
                    customerSelected={customerSelected}
                    jobCcEmailTags={jobCcEmailTags}
                    handleJobCcEmailsChange={handleJobCcEmailsChange}
                    handleJobCcEmailAdd={handleJobCcEmailAdd}
                    handleJobCcEmailRemove={handleJobCcEmailRemove}
                    jobDateAt={jobDateAt}
                    setJobDateAt={setJobDateAt}
                    readyAt={readyAt}
                    setReadyAt={setReadyAt}
                    dropAt={dropAt}
                    setDropAt={setDropAt}
                    jobTypeOptions={jobTypeOptions}
                    handleBTypeReferenceChange={handleBTypeReferenceChange}
                    _refinedData={refinedData}
                    setRefinedData={setRefinedData}
                    today={today}
                    setIsSameDayJob={setIsSameDayJob}
                    setIsTomorrowJob={setIsTomorrowJob}
                    savedAddressesSelect={savedAddressesSelect}
                    pickUpDestination={pickUpDestination}
                    setPickUpDestination={setPickUpDestination}
                    getCustomerAddresses={getCustomerAddresses}
                    jobDestinations={jobDestinations}
                    handleJobDestinationChanged={handleJobDestinationChanged}
                    addToJobDestinations={addToJobDestinations}
                    handleRemoveFromJobDestinations={
                      handleRemoveFromJobDestinations
                    }
                    quoteCalculationRes={quoteCalculationRes}
                    buttonText={buttonText}
                    handleSaveJobPriceCalculation={
                      handleSaveJobPriceCalculation
                    }
                    downloadQuotePdf={downloadQuotePdf}
                    isDownloading={isDownloading}
                    filtereddepotOptions={filtereddepotOptions}
                    setFilteredDepotOptions={setFilteredDepotOptions}
                    setSelectedDepot={setSelectedDepot}
                    sendFreightData={sendFreightData}
                    jobItems={jobItems}
                    addToJobItems={addToJobItems}
                    handleRemoveFromJobItems={handleRemoveFromJobItems}
                    handleJobItemChanged={handleJobItemChanged}
                    itemsTableColumns={itemsTableColumns}
                    itemTypes={itemTypes}
                    getJob={getJob}
                    handleDeleteMedia={handleDeleteMedia}
                    jobLoading={jobLoading}
                    attachmentColumns={attachmentColumns}
                    handleDeleteJob={handleDeleteJob}
                    onChangeCustomerSearchQuery={onChangeCustomerSearchQuery}
                    onChangeSearchQuery={onChangeSearchQuery}
                    textColorSecodary={textColorSecodary}
                    _updatingMedia={updatingMedia}
                    setUpdatingMedia={setUpdatingMedia}
                  />
                )}

                { }
                {tabId == 2 && <ReportsTab jobObject={reportJob} />}
                { }
                {tabId == 3 && <MessageLogTab jobObject={job} />}
                { }
                {tabId == 4 && <InvoiceTab jobObject={job} />}
                { }
                {tabId == 5 && <AuditLogTab jobObjectId={job.id} activeTab="audit" />}
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent hidden={!isAdminUser}>
          <ModalHeader>Email Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="bold" mb={2}>
              Subject:
            </Text>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              mb={4}
            />
            <Text fontWeight="bold" mb={2}>
              Body:
            </Text>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              minH="300px"
              whiteSpace="pre-line"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                handleSendEmail();
                onClose();
              }}
            >
              Send Email
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default JobEdit;