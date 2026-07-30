"use client";
import dynamic from "next/dynamic";
import { useMutation } from "@apollo/client/react";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import { Alert, AlertIcon, AlertTitle } from "@chakra-ui/react";
import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { faTrashCan } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import ColorSelect from "@/components/fields/ColorSelect";
import JobUrgencyToggle from "@/components/jobs/JobUrgencyToggle";
import CustomInputField from "@/components/fields/VCustomInputField";
import TogglePill from "@/components/fields/TogglePill";
import Time12HourPicker from "@/components/fields/Time12HourPickerCreateJob";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { GET_COMPANYS_QUERY, GET_COMPANY_QUERY } from "@/graphql/company";
import { GET_COMPANY_RATE_QUERY, GET_TIMEZONE_QUERY } from "@/graphql/CompanyRate";
import { defaultCustomer, GET_CUSTOMERS_QUERY } from "@/graphql/customer";
import { GET_CUSTOMER_ADDRESSES_QUERY, CustomerAddressesResponse } from "@/graphql/customerAddress";
import {
    CREATE_JOB_MUTATION,
    defaultJob,
    GET_ALL_TIMESLOT_DEPOTS,
    SEND_CONSIGNMENT_DOCKET,
    CreateJobResult,
} from "@/graphql/job";
import defaultJobQuoteData from "@/graphql/job";
import { GET_JOB_FORM_OPTIONS_QUERY, JobFormOptionsResponse } from "@/graphql/jobFormOptions";
import { CREATE_JOB_CC_EMAIL_MUTATION } from "@/graphql/jobCcEmails";
import {
    CREATE_JOB_DESTINATION_MUTATION,
    defaultJobDestination,
} from "@/graphql/jobDestination";
import { CREATE_JOB_ITEM_MUTATION, defaultJobItem } from "@/graphql/jobItem";
import {
    CALCULATE_SEA_FREIGHT_QUERY,
    CREATE_JOB_PRICE_CALCULATION_DETAIL_MUTATION,
    CreateJobPriceCalculationDetailInput,
    defaultJobPriceCalculationDetail,
} from "@/graphql/JobPriceCalculationDetail";
import { ADD_MEDIA_MUTATION } from "@/graphql/media";
import {
    formatDateTimeToDB,
    isAfterCutoff,
    today,
} from "@/lib/helpers/helper";
import debounce from "lodash.debounce";
import { parseCookies } from "nookies";
import { useSearchParams } from "next/navigation";
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

// ---------- Dynamically-loaded, below-the-fold components ----------
// These are split into separate JS chunks so the initial page load (h1 + Details
// card) doesn't have to wait for Google Places autocomplete, TanStack Table,
// and file-upload code to download/parse/execute. This is the main lever for
// reducing LCP — the "New Delivery Job" heading no longer waits on unrelated code.
const JobAddressesSection = dynamic(
    () => import("@/components/jobs/JobAddressesNewSection"),
    {
        ssr: false,
        loading: () => (
            <Box h="180px" bg="gray.50" borderRadius="md" w="full" />
        ),
    },
);
const JobInputTable = dynamic(
    () => import("@/components/jobs/JobNewInputTable"),
    { ssr: false },
);
const FileInput = dynamic(
    () => import("@/components/fileInput/FileInput"),
    { ssr: false },
);
const PaginationTable = dynamic(
    () => import("@/components/table/PaginationTable"),
    { ssr: false },
);
const TagsInput = dynamic(
    () => import("@/components/tagsInput"),
    { ssr: false },
);

// ---------- URL preset lookup (Booking menu -> ?id=...) ----------
const JOB_PRESETS: Record<
    string,
    {
        state?: string;
        stateCode?: string;
        transportType?: string;
        categoryLabel?: string;
        freightType?: string;
    }
> = {
    qld_import_lcl: { state: "Queensland", stateCode: "QLD", transportType: "import", categoryLabel: "LCL", freightType: "LCL" },
    qld_export_lcl: { state: "Queensland", stateCode: "QLD", transportType: "export", categoryLabel: "LCL", freightType: "LCL" },
    qld_airfreight_import: { state: "Queensland", stateCode: "QLD", transportType: "import", categoryLabel: "Airfreight", freightType: "Airfreight" },
    qld_airfreight_export: { state: "Queensland", stateCode: "QLD", transportType: "export", categoryLabel: "Airfreight", freightType: "Airfreight" },
    qld_b2b: { state: "Queensland", stateCode: "QLD" },
    vic_import_lcl: { state: "Victoria", stateCode: "VIC", transportType: "import", categoryLabel: "LCL", freightType: "LCL" },
    vic_export_lcl: { state: "Victoria", stateCode: "VIC", transportType: "export", categoryLabel: "LCL", freightType: "LCL" },
    vic_airfreight_import: { state: "Victoria", stateCode: "VIC", transportType: "import", categoryLabel: "Airfreight", freightType: "Airfreight" },
    vic_airfreight_export: { state: "Victoria", stateCode: "VIC", transportType: "export", categoryLabel: "Airfreight", freightType: "Airfreight" },
    vic_b2b: { state: "Victoria", stateCode: "VIC" },
    roadfreight: { categoryLabel: "Road Freight" },
    fcl: { categoryLabel: "FCL" },
    warehouse: { categoryLabel: "Warehouse" },
};

function stripTypename<T extends Record<string, any>>(obj: T): Omit<T, "__typename"> {
    const clean: any = { ...obj };
    delete clean.__typename;
    return clean;
}

function JobPage() {
    const toast = useToast();
    const searchParams = useSearchParams();
    const presetId = searchParams.get("id");
    const freightCalculatedRef = useRef(false);
    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);
    const {
        isAdmin,
        customerId,
        companyId,
        isCompany,
        isCompanyAdmin,
        isCustomer,
    } = useSelector((state: RootState) => state.user);
    const cookies = parseCookies();

    const [job, setJob] = useState(defaultJob);
    const [itemTypes, setItemTypes] = useState([]);
    const [customerSelected, setCustomerSelected] = useState(defaultCustomer);
    const [jobDestinations, setJobDestinations] = useState([
        { ...defaultJobDestination, ...{ id: 2, address_line_1: "" } },
    ]);
    const [pickUpDestination, setPickUpDestination] = useState({
        ...defaultJobDestination,
        ...{ id: 1, address_line_1: "" },
    });
    const [depotOptions, setDepotOptions] = useState([]);
    const [filtereddepotOptions, setFilteredDepotOptions] = useState([]);

    const [refinedData, setRefinedData] = useState({
        ...defaultJobQuoteData,
        freight_type: "LCL",
        pick_up_state: "",
        pick_up_stateCode: "",
        depotOptions: [],
        timeslot_depots: "",
        toll_enabled: false,
    });

    const [companyRates, setCompanyRates] = useState([]);
    const [quoteCalculationRes, setQuoteCalculationRes] = useState(
        defaultJobPriceCalculationDetail,
    );
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [tempcalculation, setTempcalculation] = useState({
        cbm_auto: 0,
        total_weight: 0,
    });
    const [isQuotePrice, setIsQuotePrice] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [jobItems, setJobItems] = useState([defaultJobItem]);
    const [savedAddressesSelect, setSavedAddressesSelect] = useState([]);
    const [jobCategories, setJobCategories] = useState([]);
    const [jobTypeOptions, setJobTypeOptions] = useState([]);
    const [companiesOptions, setCompaniesOptions] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [temporaryMedia, setTemporaryMedia] = useState([]);
    const [jobDateAt, setJobDateAt] = useState(today);
    const [readyAt, setReadyAt] = useState("06:00");
    const [dropAt, setDropAt] = useState("17:00");
    const [jobCcEmailTags, setJobCcEmailTags] = useState([]);
    const [isSameDayJob, setIsSameDayJob] = useState(true);
    const [isTomorrowJob, setIsTomorrowJob] = useState(false);
    const [filteredJobTypeOptions, setFilteredJobTypeOptions] = useState([]);
    const [companyWeight, setCompanyWeight] = useState(null);
    const [companyStandardStatic, setCompanyStandardStatic] = useState(null);
    const [companyToll, setCompanyToll] = useState(null);
    const re = useMemo(
        () =>
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        [],
    );
    const [isJobCreatedOpen, setIsJobCreatedOpen] = useState(false);
    const [newJobId, setNewJobId] = useState<string | null>(null);
    const [customerBaseNotes, setCustomerBaseNotes] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!job.transport_location) {
            setFilteredDepotOptions([]);
            return;
        }
        const filtered = depotOptions.filter(
            (option) => option.state_code === job.transport_location,
        );
        setFilteredDepotOptions(filtered);
    }, [job.transport_location, depotOptions]);

    const onClose = () => setIsJobCreatedOpen(false);

    const getStateCode = (stateName: string) => {
        const normalizedStateName = stateName.toLowerCase().trim();
        switch (normalizedStateName) {
            case "victoria":
                return "VIC";
            case "queensland":
                return "QLD";
            default:
                return normalizedStateName;
        }
    };

    const onChangeSearchQuery = useMemo(() => {
        return debounce((e) => {
            setDebouncedSearch(e);
        }, 300);
    }, []);

    // const defaultVariables = {
    //     query: "",
    //     page: 1,
    //     first: 100,
    //     orderByColumn: "id",
    //     orderByOrder: "ASC",
    // };

    // ---------- URL preset parsing (?id=qld_import_lcl etc.) ----------
    useEffect(() => {
        if (!presetId) return;
        const preset = JOB_PRESETS[presetId];
        if (!preset) return;

        let categoryId: number | undefined;
        if (preset.categoryLabel && jobCategories.length > 0) {
            const matched = jobCategories.find(
                (c: any) =>
                    c.label?.toLowerCase().trim() === preset.categoryLabel!.toLowerCase().trim(),
            );
            categoryId = matched?.value;
        }

        setJob((prev) => ({
            ...prev,
            transport_location: preset.stateCode ?? prev.transport_location,
            transport_type: preset.transportType ?? prev.transport_type,
            job_category_id: categoryId ?? prev.job_category_id,
        }));

        setRefinedData((prev) => ({
            ...prev,
            pick_up_stateCode: preset.stateCode ?? prev.pick_up_stateCode,
            pick_up_state: preset.state ?? prev.pick_up_state,
            transport_type: preset.transportType ?? prev.transport_type,
            freight_type: preset.freightType ?? prev.freight_type,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presetId, jobCategories]);

    const itemsTableColumns = useMemo(
        () => [
            { id: "type", header: "Type" },
            { id: "dimensions", header: "DIMENSIONS (L,W,H)" },
            { id: "qty", header: "QTY" },
            { id: "weight", header: "WEIGHT" },
            { id: "cbm", header: "CBM" },
            { id: "action", header: "ACTION" },
        ],
        [],
    );
    const attachmentColumns = useMemo(
        () => [
            { id: "document", header: "Document", accessorKey: "path" as const },
            { id: "uploaded_by", header: "uploaded by", accessorKey: "uploaded_by" as const },
            { id: "created_at", header: "date uploaded", accessorKey: "created_at" as const },
            {
                id: "actions",
                header: "Actions",
                accessorKey: "downloadable_url" as const,
                isDelete: true,
                isEdit: false,
                isDownload: true,
            },
        ],
        [],
    );

    // ---------- Manually-triggered lookups (lazy) ----------

    const [getCompanyRatesQuery] = useApolloLazyQueryWithEffect<any>(
        GET_COMPANY_RATE_QUERY,
        {
            fetchPolicy: "network-only",
            onCompleted: (data) => {
                if (data?.getRatesByCompany) {
                    setCompanyRates([...data.getRatesByCompany]);
                    setRefinedData((prev) => ({
                        ...prev,
                        company_rates: [...data.getRatesByCompany],
                    }));
                }
            },
        },
    );
    const getCompanyRates = (variables: any) =>
        getCompanyRatesQuery({ variables });

    const [getCompanyQuery] = useApolloLazyQueryWithEffect<any>(
        GET_COMPANY_QUERY,
        {
            onCompleted: (data) => {
                if (data?.company?.weight_per_cubic != null) {
                    setCompanyWeight(data.company.weight_per_cubic);
                }
                if (data?.company?.standard_static != null) {
                    setCompanyStandardStatic(data.company.standard_static ? 1 : 0);
                }
                if (data?.company?.toll_enabled != null) {
                    setCompanyToll(data.company.toll_enabled ? 1 : 0);
                }
            },
            onError: (error) => {
                console.error("Error fetching company weight:", error);
            },
        },
    );
    const getCompany = (variables: any) => getCompanyQuery({ variables });

    useApolloQueryWithEffect(GET_ALL_TIMESLOT_DEPOTS, {
        onCompleted: (data: any) => {
            console.log("Raw depot API response:", data);
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
            toast({
                title: "Error fetching depots",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const [getTimezoneQuery] = useApolloLazyQueryWithEffect<any>(
        GET_TIMEZONE_QUERY,
        { fetchPolicy: "network-only" },
    );
    const getTimezone = (variables: any) => getTimezoneQuery({ variables });

    // ---------- Consolidated form-options query ----------
    useApolloQueryWithEffect<JobFormOptionsResponse>(GET_JOB_FORM_OPTIONS_QUERY, {
        fetchPolicy: "cache-and-network",
        onCompleted: (data) => {
            const opts = data?.jobFormOptions;
            if (!opts) return;

            const itemTypesArray = (opts.item_types || []).map((t) => ({
                value: parseInt(t.id),
                label: t.name,
            }));
            itemTypesArray.sort((a, b) => {
                if (a.label === "Other") return 1;
                if (b.label === "Other") return -1;
                return 0;
            });
            setItemTypes(itemTypesArray);

            const jobTypeOpts = (opts.job_types || []).map((t) => ({
                value: parseInt(t.id),
                label: t.name,
            }));
            setJobTypeOptions(jobTypeOpts);
            setFilteredJobTypeOptions(jobTypeOpts);

            if (isMounted.current) {
                setJobCategories(
                    (opts.job_categories || []).map((c) => ({
                        value: parseInt(c.id),
                        label: c.name,
                    })),
                );
            }

            setCompaniesOptions(
                (opts.companies || []).map((c: any) => ({
                    value: parseInt(c.id),
                    label: c.name,
                    toll: c.toll_enabled,
                })),
            );
        },
        onError: (error) => {
            console.error("Job form options fetch failed:", error);
        },
    });

    useApolloQueryWithEffect(GET_COMPANYS_QUERY, {
        variables: {
            query: debouncedSearch,
            page: 1,
            first: 100,
            orderByColumn: "id",
            orderByOrder: "ASC",
        },
        skip: !debouncedSearch,
        onCompleted: (data: any) => {
            const newCompaniesOptions = data.companys.data.map((_entity: any) => ({
                value: parseInt(_entity.id),
                label: _entity.name,
                toll: _entity.toll_enabled,
            }));

            setCompaniesOptions(newCompaniesOptions);

            const selectedCompany = newCompaniesOptions.find(
                (entity: { value: number }) => entity.value == job.company_id,
            );

            if (selectedCompany) {
                setRefinedData((prev) => ({
                    ...prev,
                    toll_enabled: selectedCompany.toll,
                }));
            }

            if (!isAdmin) {
                const companyWithId = newCompaniesOptions.find(
                    (entity: { value: number }) => entity.value == companyId,
                );
                if (companyWithId) {
                    setRefinedData((prev) => ({
                        ...prev,
                        toll_enabled: companyWithId.toll,
                    }));
                }
            }
        },
    });

    const downloadPDFapiUrl = process.env.NEXT_PUBLIC_PRICE_BREAKDOWN_API_URL;

    const downloadQuotePdf = async () => {
        if (!validateAddresses()) return;
        if (!validateTimeslotDepot()) return;
        if (
            !job.job_type_id ||
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

        if (!downloadPDFapiUrl) {
            toast({
                title: "Download unavailable",
                description: "Price breakdown API URL is not configured.",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

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
        const { totalCBM, totalWeight } = calculateFinalWeightCBM(
            job.job_category_id,
            jobItems,
            companyWeight,
        );
        const finalCBM = parseFloat(totalCBM.toFixed(2));
        const finalWeight = parseFloat(totalWeight.toFixed(2));

        const payload = {
            company_id: isAdmin ? Number(job.company_id) : Number(companyId),
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
            service_choice: refinedData.service_choice,
            state:
                refinedData.state ||
                job.pick_up_state ||
                pickUpDestination?.address_state,
            state_code: refinedData.state_code || refinedData.pick_up_stateCode,
            ready_by: readyAt,
            drop_by: dropAt,
            freight_type: refinedData.freight_type,
            company_rates:
                ((job.job_category_id == 1 || job.job_category_id == 2) &&
                    refinedData.pick_up_stateCode === "QLD") ||
                    refinedData.pick_up_stateCode === "VIC"
                    ? filteredCompanyRates.map((rate) => ({
                        company_id: rate.company_id,
                        area: rate.area,
                        seafreight_id: rate.seafreight_id,
                        cbm_rate: rate.cbm_rate,
                        minimum_charge: rate.minimum_charge,
                    }))
                    : [],
            toll_enabled: refinedData.toll_enabled,
            surcharges: {
                hand_unload: job.is_hand_unloading || false,
                dangerous_goods: job.is_dangerous_goods || false,
                time_slot: job.is_inbound_connect || false,
                timeslot_depots: job.is_inbound_connect
                    ? refinedData.timeslot_depots
                    : null,
                tail_lift: job.is_tailgate_required || false,
                stackable: true,
            },
            total_weight: finalWeight,
            total_cbm: finalCBM,
        };

        try {
            const response = await fetch(downloadPDFapiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Quote_Price_Breakdown.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

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
        }
    };

    useEffect(() => {
        if ((!isCompany && !isCompanyAdmin) || !companyId) return;
        if (job.company_id === companyId) return;

        setJob((prev) => ({ ...prev, company_id: companyId }));
        getCustomersByCompanyId({ company_id: companyId });
        getCompanyRates({ company_id: Number(companyId) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    useEffect(() => {
        if (job.company_id) {
            const selectedCompany = companiesOptions.find(
                (company) => company.value === Number(job.company_id),
            );

            const tollEnabled = selectedCompany?.toll ?? false;

            setRefinedData((prev) => ({
                ...prev,
                toll_enabled: tollEnabled,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.job_type_id]);

    const handleBTypeReferenceChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
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

    const [handleCreateJob] = useMutation<CreateJobResult>(CREATE_JOB_MUTATION, {
        variables: {
            input: {
                ...job,
                id: undefined,
                company_id: isAdmin ? Number(job.company_id) : Number(companyId),
                job_status_id: 1,
                job_type_id: job.job_type_id,
                transport_type: job.transport_type,
                transport_location: job.transport_location,
                timeslot_depots: job.timeslot_depots,
                reference_no:
                    job.b_reference_no?.trim() &&
                        job.b_reference_no.toUpperCase().startsWith("B")
                        ? job.b_reference_no
                        : job.reference_no,
                b_reference_no: job.b_reference_no,
                media: undefined,
            },
        },
        onCompleted: async (data) => {
            const jobId = String(data?.createJob.id);
            toast({
                title: "creating your job",
                status: "info",
                duration: 10000,
                isClosable: true,
            });

            try {
                let _jobCcEmailTags = [...jobCcEmailTags];
                for (let jobCcEmailTag of _jobCcEmailTags) {
                    await handleCreateJobCcEmail({
                        input: {
                            id: undefined,
                            email: jobCcEmailTag,
                            job_id: parseInt(jobId),
                        },
                    });
                }

                let _jobItems = [...jobItems];
                for (let jobItem of _jobItems) {
                    jobItem.job_id = parseInt(jobId);
                    await handleCreateJobItem({
                        input: {
                            ...jobItem,
                            is_new: undefined,
                            dimension_height_cm: undefined,
                            dimension_width_cm: undefined,
                            dimension_depth_cm: undefined,
                            volume_cm: undefined,
                            id: undefined,
                            item_type: undefined,
                        },
                    });
                }

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

                const selectedCompany = companiesOptions.find(
                    (company) => company.value === Number(companyId),
                );

                const tollEnabled = selectedCompany?.toll ?? false;

                const { totalCBM, totalWeight } = calculateFinalWeightCBM(
                    job.job_category_id,
                    _jobItems,
                    companyWeight,
                );
                const finalCBM = parseFloat(totalCBM.toFixed(2));
                const finalWeight = parseFloat(totalWeight.toFixed(2));

                setRefinedData((prev) => ({
                    ...prev,
                    toll_enabled: tollEnabled,
                }));

                try {
                    const response = await handleCalculateSeaFreight({
                        variables: {
                            input: {
                                company_id: Number(companyId),
                                transport_type: job.transport_type,
                                service_choice: refinedData.service_choice,
                                state:
                                    refinedData.state ||
                                    job.pick_up_state ||
                                    pickUpDestination.address_state,
                                state_code:
                                    refinedData.state_code || refinedData.pick_up_stateCode,

                                freight_type: refinedData.freight_type,

                                pickup_time: { ready_by: readyAt },
                                delivery_time: { drop_by: dropAt },

                                ready_by: readyAt,
                                drop_by: dropAt,

                                job_pickup_address: {
                                    suburb: pickUpDestination?.address_city,
                                    postcode: pickUpDestination?.address_postal_code,
                                    state: pickUpDestination?.address_state,
                                },

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

                                company_rates:
                                    filteredCompanyRates?.map((rate) => ({
                                        company_id: rate.company_id,
                                        seafreight_id: rate.seafreight_id,
                                        area: rate.area,
                                        cbm_rate: rate.cbm_rate,
                                        minimum_charge: rate.minimum_charge,
                                    })) || [],
                                toll_enabled: tollEnabled,
                                surcharges: {
                                    hand_unload: job.is_hand_unloading || false,
                                    dangerous_goods: job.is_dangerous_goods || false,
                                    time_slot: job.is_inbound_connect || false,
                                    timeslot_depots: job.is_inbound_connect
                                        ? refinedData.timeslot_depots
                                        : [],
                                    tail_lift: job.is_tailgate_required || false,
                                    stackable: false,
                                },

                                total_weight: finalWeight,
                                total_cbm: finalCBM,
                            },
                        },
                    });

                    const calculationData = response.data?.calculateSeaFreight;

                    if (!calculationData) {
                        throw new Error("No calculation data received from API");
                    }

                    await handleCreateJobPriceCalculationDetail({
                        job_id: parseInt(jobId),
                        customer_id: Number(job.customer_id),
                        cbm_auto: Number(finalCBM ?? 0),
                        total_weight: Number(finalWeight ?? 0),
                        freight: Number(calculationData.freight ?? 0),
                        fuel: Number(calculationData.fuel ?? 0),
                        hand_unload: Number(calculationData.hand_unload ?? 0),
                        dangerous_goods: Number(calculationData.dangerous_goods ?? 0),
                        time_slot: Number(calculationData.time_slot ?? 0),
                        tail_lift: Number(calculationData.tail_lift ?? 0),
                        stackable: Number(calculationData.stackable ?? 0),
                        total: Number(calculationData.total ?? 0),
                        toll_applied: calculationData.toll_applied ?? false,
                        toll_type: calculationData.toll_type ?? null,
                        toll_amount: Number(calculationData.toll_amount ?? 0),
                        toll_levy_type: calculationData.toll_levy_type ?? null,
                        fuel_levy_percentage: calculationData.fuel_levy_percentage ?? 0,
                        toll_levy_percentage: calculationData.toll_levy_percentage ?? 0,
                        fuel_levy_amount: calculationData.fuel_levy_amount ?? 0,
                        toll_levy_amount: calculationData.toll_levy_amount ?? 0,
                    });
                } catch (err) {
                    console.error("Error in price calculation", err);
                    toast({
                        title: "Price calculation failed",
                        description: err instanceof Error ? err.message : "Unknown error",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }

                await handleCreateJobDestination({
                    input: stripTypename({
                        ...pickUpDestination,
                        is_pickup: true,
                        customer_id: undefined,
                        id: undefined,
                        job_id: parseInt(jobId),
                        jobDestination: undefined,
                    }),
                });

                for (let jobDestination of jobDestinations) {
                    await handleCreateJobDestination({
                        input: stripTypename({
                            ...jobDestination,
                            is_pickup: false,
                            customer_id: undefined,
                            id: undefined,
                            job_id: parseInt(jobId),
                            jobDestination: undefined,
                        }),
                    });
                }

                await handleSendConsignmentDocket({
                    variables: { id: parseInt(jobId) },
                });

                for (const media of temporaryMedia) {
                    const reader = new FileReader();

                    await new Promise<void>((resolve, _reject) => {
                        reader.onerror = () => {
                            resolve();
                        };
                        reader.onabort = () => {
                            resolve();
                        };
                        reader.onload = () => {
                            handleCreateMedia({
                                variables: {
                                    input: {
                                        entity: "Job",
                                        entity_id: data.createJob.id,
                                    },
                                    media: media.file,
                                },
                            });
                            setTimeout(resolve, 100);
                        };
                        reader.readAsArrayBuffer(media.file);
                    });
                }

                toast({
                    title: "Job created",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                setNewJobId(jobId);
                setIsJobCreatedOpen(true);
            } catch (err) {
                console.error("Error in post-create flow", err);
                toast({
                    title: "Job creation failed",
                    description: err instanceof Error ? err.message : "Unknown error",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        },
        onError: (error) => {
            setIsSaving(false);
            showGraphQLErrorToast(error);
        },
    });

    const [handleCreateMedia] = useMutation(ADD_MEDIA_MUTATION, {
        onCompleted: () => { },
        onError: (error) => {
            showGraphQLErrorToast(error);
        },
    });
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

    const handleCreateJobPriceCalculationDetail = (
        jobPriceDetail: CreateJobPriceCalculationDetailInput,
    ) => {
        return new Promise((resolve, reject) => {
            createJobPriceCalculationDetail({
                variables: { input: jobPriceDetail },
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

    const [createJobPriceCalculationDetail] = useMutation(
        CREATE_JOB_PRICE_CALCULATION_DETAIL_MUTATION,
    );

    const handleCreateJobCcEmail = (jobCcEmail: any) => {
        return new Promise((resolve, reject) => {
            createJobCcEmail({ variables: jobCcEmail })
                .then(({ data }) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                    showGraphQLErrorToast(error);
                });
        });
    };
    const [createJobCcEmail] = useMutation(CREATE_JOB_CC_EMAIL_MUTATION);

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

    const [handleSendConsignmentDocket] = useMutation(SEND_CONSIGNMENT_DOCKET);

    const formatToSelect = (
        _entityArray: any[],
        valueKeyName: string,
        labelKeyName: string,
        extraKeyName?: string,
    ) => {
        return _entityArray.map((_entityItem) => {
            const baseObject: any = {
                value: _entityItem[valueKeyName],
                label: _entityItem[labelKeyName],
                entity: _entityItem,
            };

            if (extraKeyName && _entityItem[extraKeyName] !== undefined) {
                baseObject[extraKeyName] = _entityItem[extraKeyName];
            }

            return baseObject;
        });
    };
    const addToJobDestinations = () => {
        let nextId = jobDestinations[jobDestinations.length - 1].id + 1;
        setJobDestinations((jobDestinations) => [
            ...jobDestinations,
            { ...defaultJobDestination, ...{ id: nextId } },
        ]);
    };

    const handleRemoveFromJobDestinations = (index: number) => {
        setJobDestinations((prev) => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    const handleJobDestinationChanged = async (value: any, index: number) => {
        let _jobDestinations = [...jobDestinations];
        _jobDestinations[index] = value;
        setJobDestinations(_jobDestinations);
        // filtereddepotOptions is kept in sync automatically by the
        // useEffect watching job.transport_location — no manual filtering here.
    };

    // ---------- Customer addresses (lazy — depends on selected customer) ----------
    const [getCustomerAddressesQuery] = useApolloLazyQueryWithEffect<CustomerAddressesResponse>(
        GET_CUSTOMER_ADDRESSES_QUERY,
        {
            onCompleted: (data) => {
                setSavedAddressesSelect([]);
                setSavedAddressesSelect(
                    formatToSelect(data.customerAddresses.data, "id", "address_business_name"),
                );
            },
        },
    );
    const getCustomerAddresses = () =>
        getCustomerAddressesQuery({
            variables: {
                query: "",
                page: 1,
                first: 200,
                orderByColumn: "id",
                orderByOrder: "ASC",
                customer_id: job.customer_id,
            },
        });

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.customer_id, customerOptions]);

    const handleRemoveFromJobItems = (index: number) => {
        let _jobItems = [...jobItems];
        _jobItems.splice(index, 1);
        setJobItems(_jobItems);
        const { totalCBM, totalWeight } = calculateFinalWeightCBM(
            job.job_category_id,
            _jobItems,
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
            value.dimension_height_cm = parseFloat(value.dimension_height) * 100;
        }
        if (!value.dimension_width_cm) {
            value.dimension_width_cm = parseFloat(value.dimension_width) * 100;
        }
        if (!value.dimension_depth_cm) {
            value.dimension_depth_cm = parseFloat(value.dimension_depth) * 100;
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
        const { totalCBM, totalWeight } = calculateFinalWeightCBM(
            job.job_category_id,
            _jobItems,
            companyWeight,
        );
        setQuoteCalculationRes((prev) => ({
            ...prev,
            total_weight: totalWeight,
            cbm_auto: totalCBM,
        }));
    };

    useEffect(() => {
        const calculateTotals = () => {
            const { totalCBM, totalWeight } = calculateFinalWeightCBM(
                job.job_category_id,
                jobItems,
                companyWeight,
            );

            setTempcalculation({
                cbm_auto: parseFloat(totalCBM.toFixed(2)),
                total_weight: parseFloat(totalWeight.toFixed(2)),
            });
        };

        calculateTotals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyWeight, job.job_category_id, jobItems]);

    const addToJobItems = () => {
        let nextId = jobItems[jobItems.length - 1].id + 1;
        setJobItems((jobItems) => [
            ...jobItems,
            { ...defaultJobItem, ...{ id: nextId } },
        ]);
    };

    const dateChanged = useCallback(() => {
        try {
            setJob((prev) => ({
                ...prev,
                ready_at: formatDateTimeToDB(jobDateAt, readyAt),
                drop_at: formatDateTimeToDB(jobDateAt, dropAt),
            }));
        } catch (e) { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobDateAt, readyAt, dropAt]);

    useEffect(() => {
        dateChanged();
    }, [dateChanged]);

    const handleRemoveFromTemporaryMedia = (id: number) => {
        let _temporaryMedia = [...temporaryMedia];
        _temporaryMedia = _temporaryMedia.filter((e) => e.id !== id);
        setTemporaryMedia(_temporaryMedia);
    };

    // ---------- Customers by company (lazy — triggered on company change) ----------
    const [getCustomersByCompanyIdQuery] = useApolloLazyQueryWithEffect<any>(
        GET_CUSTOMERS_QUERY,
        {
            onCompleted: (data) => {
                setCustomerOptions([]);
                let _customerOptions = formatToSelect(
                    data.customers.data,
                    "id",
                    "full_name",
                    "base_notes",
                );
                setCustomerOptions(_customerOptions);
                if (isCustomer) {
                    setJob((prevJob) => ({
                        ...prevJob,
                        customer_id: customerId || Number(cookies.customer_id),
                    }));

                    const selectedCustomer = _customerOptions.find(
                        (_e) => _e.value === customerId,
                    )?.entity;
                    if (selectedCustomer) {
                        setCustomerSelected(selectedCustomer);
                    }
                    getCustomerAddresses();
                }
            },
        },
    );
    const getCustomersByCompanyId = (extraVars: any) =>
        getCustomersByCompanyIdQuery({
            variables: {
                query: "",
                page: 1,
                first: 100,
                orderByColumn: "id",
                orderByOrder: "ASC",
                ...extraVars,
            },
        });

    useEffect(() => {
        if (!isCompany || !job.company_id) return;
        getCustomersByCompanyId({ company_id: job.company_id });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCompany, job.company_id]);

    const handleJobCcEmailsChange = useCallback(
        (_event: SyntheticEvent, jobCcEmailTags: string[]) => {
            setJobCcEmailTags(
                jobCcEmailTags.filter((email) => {
                    if (!re.test(email)) {
                        toast({
                            title: "Invalid email",
                            description: "Please enter a valid email",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                        });
                    }
                    return re.test(email);
                }),
            );
        },
        [re, toast],
    );

    const resetJobTypeAndShowToast = () => {
        setJob((prev) => ({
            ...prev,
            job_type_id: null,
        }));
        toast({
            title: "Job Type Required",
            description:
                "Standard service is no longer available for this time. Please select Express or Urgent.",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
    };

    useEffect(() => {
        let hasShownToast = false;

        const checkAndUpdateJobTypes = async () => {
            try {
                if (!jobTypeOptions.length) return;
                if (!pickUpDestination?.address_state) {
                    setFilteredJobTypeOptions(jobTypeOptions);
                    return;
                }
                const res = await getTimezone({
                    state: pickUpDestination.address_state,
                });

                const timezone = res?.data?.getTimezone?.timeZoneId;

                let updatedOptions = [...jobTypeOptions];

                if (job.job_category_id === 1) {
                    if (isSameDayJob) {
                        updatedOptions = updatedOptions.filter(
                            (opt) => opt.label !== "Standard",
                        );
                        if (!hasShownToast) {
                            resetJobTypeAndShowToast();
                            hasShownToast = true;
                        }
                    } else if (isTomorrowJob) {
                        const cutoffTime = job.company_id == 361 ? "17:00" : "16:00";
                        const isAfterCut = isAfterCutoff(cutoffTime, timezone);
                        if (isAfterCut) {
                            updatedOptions = updatedOptions.filter(
                                (opt) => opt.label !== "Standard",
                            );
                            if (!hasShownToast) {
                                resetJobTypeAndShowToast();
                                hasShownToast = true;
                            }
                        }
                    }
                }

                if (job.job_category_id === 2 && isSameDayJob) {
                    const isAfterCut = isAfterCutoff("11:00", timezone);
                    if (isAfterCut) {
                        updatedOptions = updatedOptions.filter(
                            (opt) => opt.label !== "Standard",
                        );
                        if (!hasShownToast) {
                            resetJobTypeAndShowToast();
                            hasShownToast = true;
                        }
                    }
                }

                setFilteredJobTypeOptions(updatedOptions);
            } catch (error) {
                console.error("Error updating job type options:", error);
                toast({
                    title: "Error",
                    description:
                        error instanceof Error ? error.message : "Unknown error occurred",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
                setFilteredJobTypeOptions(jobTypeOptions);
            }
        };

        checkAndUpdateJobTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        jobTypeOptions,
        pickUpDestination?.lat,
        pickUpDestination?.lng,
        job.job_category_id,
        jobDateAt,
        isSameDayJob,
        isTomorrowJob,
    ]);

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

    const validateTimeslotDepot = () => {
        if (
            job.is_inbound_connect === true &&
            (job.job_category_id == 1 || job.job_category_id == 2) &&
            (!job.timeslot_depots || job.timeslot_depots === "")
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

    const handleJobCreation = () => {
        if (!validateAddresses()) return;
        if (!validateTimeslotDepot()) return;

        if (!job.job_type_id) {
            toast({
                title: "Job Type Required",
                description: "Please select the urgency/job type before creating the job.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const selectedJobTypeName = filteredJobTypeOptions.find(
            (opt) => opt.value === job.job_type_id,
        )?.label;

        setRefinedData((prev) => ({
            ...prev,
            service_choice: selectedJobTypeName || null,
        }));

        if (
            (job.job_category_id == 1 || job.job_category_id == 2) &&
            (!job.transport_type ||
                job.transport_type == "" ||
                job.transport_type == null)
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
        if (isAdmin && !job.company_id) {
            toast({
                title: "Company Required",
                description: "Please select a company and customer again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setIsSaving(true);
        handleCreateJob();
    };

    const [handleCalculateSeaFreight] = useApolloLazyQueryWithEffect<any>(
        CALCULATE_SEA_FREIGHT_QUERY,
        {
            fetchPolicy: "no-cache",
            onCompleted: (data) => {
                setQuoteCalculationRes((prev) => ({
                    ...prev,
                    ...data.calculateSeaFreight,
                }));
                freightCalculatedRef.current = true;
                setIsQuotePrice(true);
            },
            onError: (error) => {
                showGraphQLErrorToast(error);
            },
        },
    );

    const sendFreightData = async () => {
        if (!validateAddresses()) return;
        if (!validateTimeslotDepot()) return;
        if (
            !job.job_type_id ||
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
        const selectedCompany = companiesOptions.find(
            (company) => company.value === Number(companyId),
        );

        const tollEnabled = selectedCompany?.toll ?? false;

        setRefinedData((prev) => ({
            ...prev,
            toll_enabled: tollEnabled,
        }));

        const { totalCBM, totalWeight } = calculateFinalWeightCBM(
            job.job_category_id,
            jobItems,
            companyWeight,
        );

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
                        service_choice: refinedData.service_choice,
                        company_rates:
                            ((job.job_category_id == 1 || job.job_category_id == 2) &&
                                refinedData.pick_up_stateCode === "QLD") ||
                                refinedData.pick_up_stateCode === "VIC"
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

                        freight_type: refinedData.freight_type,

                        pickup_time: { ready_by: readyAt },
                        delivery_time: { drop_by: dropAt },

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
                                ? refinedData.timeslot_depots
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

            setQuoteCalculationRes((prev) => ({
                ...prev,
                ...calculationData,
            }));
            freightCalculatedRef.current = true;
            setIsQuotePrice(true);
            return calculationData;
        } catch (error) {
            console.error("Error:", error);
        }
    };
    // const downloadPDFapiUrl = process.env.NEXT_PUBLIC_PRICE_BREAKDOWN_API_URL;

    // const _downloadQuotePdf = async () => {
    //     if (!validateAddresses()) return;
    //     if (!validateTimeslotDepot()) return;
    //     if (
    //         job.job_type_id === null ||
    //         job.job_type_id === undefined ||
    //         refinedData.service_choice === ""
    //     ) {
    //         toast({
    //             title: "Job Type Required",
    //             description: "Please select the available job type once again.",
    //             status: "warning",
    //             duration: 3000,
    //             isClosable: true,
    //         });
    //         return;
    //     }
    //     if (
    //         (job.job_category_id == 1 || job.job_category_id == 2) &&
    //         (!job.transport_type || job.transport_type === "")
    //     ) {
    //         toast({
    //             title: "Transport Type Required",
    //             description: "Please select Import or Export as the transport type.",
    //             status: "warning",
    //             duration: 3000,
    //             isClosable: true,
    //         });
    //         return;
    //     }

    //     toast({
    //         title: "Download unavailable",
    //         description: "PDF download requires the axios package to be installed.",
    //         status: "warning",
    //         duration: 4000,
    //         isClosable: true,
    //     });
    //     // TODO: uncomment once `axios` package is installed (npm install axios)
    //     // and reinstate the axios.post(...) block that was here.
    // };

    return (
        <Box
            className="mk-customers-id overflow-auto"
            pt={{ base: "130px", md: "97px", xl: "97px" }}
            backgroundColor="white"
        >
            <Grid
                pr="24px"
                className="mk-mainInner"
                h={{
                    base: "calc(100vh - 130px)",
                    md: "calc(100vh - 97px)",
                    xl: "calc(100vh - 97px)",
                }}
            >
                {
                    <Grid pl="6" backgroundColor="white">
                        <FormControl>
                            <h1 className="my-8">
                                {isAdmin ? "New Delivery Job" : "New Job Booking"}
                            </h1>

                            {/* ---------- Details card (2-column grid + 3-column notes row) ---------- */}
                            <Box
                                bg="white"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="12px"
                                p="20px"
                                mb="20px"
                            >
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacingX="20px" spacingY="0px">
                                    <CustomInputField
                                        isSelect={true}
                                        optionsArray={jobCategories}
                                        label="Job category"
                                        value={jobCategories.find(
                                            (job_category) =>
                                                job_category.value === job.job_category_id,
                                        )}
                                        placeholder=""
                                        onChange={(e) => {
                                            const selectedCategory = e.value;
                                            const selectedCategoryName = jobCategories.find(
                                                (job_category) =>
                                                    job_category.value === selectedCategory,
                                            )?.label;

                                            setJob((prev) => ({
                                                ...prev,
                                                job_category_id: selectedCategory || null,
                                            }));

                                            setRefinedData((prev) => ({
                                                ...prev,
                                                freight_type: selectedCategoryName || null,
                                            }));
                                        }}
                                    />

                                    {isAdmin && (
                                        <CustomInputField
                                            isSelect={true}
                                            optionsArray={companiesOptions}
                                            label="Company"
                                            value={companiesOptions.find(
                                                (entity) => entity.value === job.company_id,
                                            )}
                                            placeholder=""
                                            onInputChange={(e) => {
                                                onChangeSearchQuery(e);
                                            }}
                                            onChange={(e) => {
                                                setCustomerSelected(defaultCustomer);
                                                getCustomersByCompanyId({ company_id: e.value });
                                                setJob((prev) => ({
                                                    ...prev,
                                                    company_id: e.value || null,
                                                    customer_id: null,
                                                }));

                                                setRefinedData((prev) => ({
                                                    ...prev,
                                                    area: null,
                                                    cbm_rate: null,
                                                    minimum_charge: null,
                                                    toll_enabled: null,
                                                }));

                                                if (e.value) {
                                                    setCompanyWeight(null);
                                                    getCompany({ id: String(e.value) }).then((res) => {
                                                        setCompanyWeight(res.data?.company?.weight_per_cubic);
                                                        setCompanyStandardStatic(
                                                            res.data?.company?.standard_static ? 1 : 0,
                                                        );
                                                        setCompanyToll(res.data?.company?.toll_enabled ? 1 : 0);
                                                    });
                                                    getCompanyRates({ company_id: Number(e.value) });
                                                }
                                            }}
                                        />
                                    )}

                                    {(job.job_category_id == 1 || job.job_category_id == 2) && (
                                        <>
                                            <CustomInputField
                                                key="transport_typeKey"
                                                isSelect={true}
                                                optionsArray={[
                                                    { value: "import", label: "Import" },
                                                    { value: "export", label: "Export" },
                                                ]}
                                                label="Transport Type"
                                                name="transport_type"
                                                value={[
                                                    { value: "import", label: "Import" },
                                                    { value: "export", label: "Export" },
                                                ].find((_e) => _e.value === job.transport_type)}
                                                placeholder=""
                                                onChange={(e) => {
                                                    setJob((prev) => ({ ...prev, transport_type: e.value }));
                                                    setRefinedData((prev) => ({ ...prev, transport_type: e.value }));
                                                }}
                                            />

                                            <Box>
                                                <CustomInputField
                                                    key="locationKey"
                                                    isSelect={true}
                                                    optionsArray={[
                                                        { value: "VIC", label: "Victoria" },
                                                        { value: "QLD", label: "Queensland" },
                                                    ]}
                                                    label="State"
                                                    name="transport_location"
                                                    value={[
                                                        { value: "VIC", label: "Victoria" },
                                                        { value: "QLD", label: "Queensland" },
                                                    ].find((_e) => _e.value === job.transport_location)}
                                                    placeholder=""
                                                    onChange={(e) => {
                                                        setJob((prev) => ({ ...prev, transport_location: e.value }));
                                                        setRefinedData((prev) => ({
                                                            ...prev,
                                                            state_code: e.value,
                                                            state: e.label,
                                                        }));
                                                    }}
                                                />
                                                <Text color="red.500" fontSize="xs" mt="4px">
                                                    Note: For LCL and Airfreight Only
                                                </Text>
                                            </Box>
                                        </>
                                    )}

                                    {isAdmin && (
                                        <CustomInputField
                                            isSelect={true}
                                            optionsArray={customerOptions}
                                            label="Customer"
                                            value={
                                                customerOptions.find(
                                                    (entity) => entity.value === job.customer_id,
                                                ) || { value: 0, label: "" }
                                            }
                                            placeholder=""
                                            isDisabled={!isAdmin}
                                            onChange={(e) => {
                                                setCustomerBaseNotes(e.base_notes);
                                                setJob((prev) => ({
                                                    ...prev,
                                                    base_notes: e.base_notes,
                                                    ...(isAdmin ? { customer_id: e.value || null } : {}),
                                                }));
                                                const selectedCustomer = customerOptions.find(
                                                    (_e) => _e.value === e.value,
                                                )?.entity;
                                                if (selectedCustomer) {
                                                    setCustomerSelected(selectedCustomer);
                                                }
                                            }}
                                        />
                                    )}
                                    {!isAdmin && (
                                        <CustomInputField
                                            isSelect={true}
                                            optionsArray={customerOptions}
                                            label="Booked by"
                                            value={
                                                customerOptions.find(
                                                    (entity) => entity.value === job.customer_id,
                                                ) || { value: 0, label: "" }
                                            }
                                            placeholder=""
                                            isDisabled={!isAdmin}
                                        />
                                    )}

                                    <CustomInputField
                                        label="Operator phone"
                                        placeholder=""
                                        isDisabled={true}
                                        name="operator_phone"
                                        value={customerSelected.phone_no}
                                        onChange={(_e) => { }}
                                    />

                                    <CustomInputField
                                        label="Operator email"
                                        placeholder=""
                                        name="operator_email"
                                        isDisabled={true}
                                        value={customerSelected.email}
                                        onChange={(_e) => { }}
                                    />

                                    <Box>
                                        <FormLabel fontSize="sm" fontWeight="500" mb="8px">
                                            Additional email notification to
                                        </FormLabel>
                                        <TagsInput
                                            tags={jobCcEmailTags}
                                            onTagsChange={handleJobCcEmailsChange}
                                            wrapProps={{ direction: "column", align: "start", width: "100%" }}
                                            wrapItemProps={(isInput) =>
                                                isInput ? { alignSelf: "stretch" } : null
                                            }
                                        />
                                    </Box>

                                    <CustomInputField
                                        label="Date"
                                        type={"date"}
                                        placeholder=""
                                        name="job_date_at"
                                        value={jobDateAt}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => {
                                            const selected = e.target.value;
                                            const today = new Date().toISOString().split("T")[0];
                                            if (selected.length >= 8 && selected < today) {
                                                toast({
                                                    title: "Invalid Date",
                                                    description: "Past dates are not allowed. Reset to today.",
                                                    status: "warning",
                                                    duration: 4000,
                                                    isClosable: true,
                                                });
                                                setJobDateAt(today);
                                                setIsSameDayJob(true);
                                                setIsTomorrowJob(false);
                                                return;
                                            }
                                            setJobDateAt(selected);
                                            setIsSameDayJob(today === selected);
                                            setIsTomorrowJob(
                                                new Date(selected).toDateString() ===
                                                new Date(
                                                    new Date(today).setDate(new Date(today).getDate() + 1),
                                                ).toDateString(),
                                            );
                                        }}
                                    />

                                    <CustomInputField
                                        label="Ready by"
                                        type={"time"}
                                        placeholder=""
                                        name="ready_at"
                                        value={readyAt}
                                        onChange={(e) => {
                                            setReadyAt(e.target.value);
                                            setJob((prev) => ({
                                                ...prev,
                                                ready_at: new Date(`${jobDateAt} ${e.target.value}`).toISOString(),
                                                drop_at: new Date(`${jobDateAt} ${dropAt}`).toISOString(),
                                            }));
                                        }}
                                    />

                                    <CustomInputField
                                        label="Drop by"
                                        type={"time"}
                                        placeholder=""
                                        name="drop_at"
                                        value={dropAt}
                                        onChange={(e) => {
                                            setDropAt(e.target.value);
                                            setJob((prev) => ({
                                                ...prev,
                                                ...(readyAt && {
                                                    ready_at: new Date(`${jobDateAt} ${readyAt}`).toISOString(),
                                                }),
                                                drop_at: new Date(`${jobDateAt} ${e.target.value}`).toISOString(),
                                            }));
                                        }}
                                    />

                                    <Box>
                                        <FormLabel fontSize="sm" fontWeight="500" mb="8px">
                                            Timeslot
                                        </FormLabel>
                                        <Time12HourPicker
                                            value={job.timeslot}
                                            onChange={(val) =>
                                                setJob((prev) => ({ ...prev, timeslot: val }))
                                            }
                                            mode="quick"
                                        />
                                    </Box>

                                    <CustomInputField
                                        label="Last Free Day / CutOff Date"
                                        type={"date"}
                                        placeholder=""
                                        name="last_free_at"
                                        value={job.last_free_at}
                                        onChange={(e) => {
                                            setJob((prev) => ({ ...prev, [e.target.name]: e.target.value }));
                                        }}
                                    />

                                    <CustomInputField
                                        label="Reference"
                                        placeholder=""
                                        name="reference_no"
                                        value={job.reference_no}
                                        onChange={(e) =>
                                            setJob((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                                        }
                                    />
                                    <CustomInputField
                                        label="B Type Reference"
                                        placeholder=""
                                        name="b_reference_no"
                                        value={job.b_reference_no}
                                        onChange={handleBTypeReferenceChange}
                                    />

                                    <CustomInputField
                                        label="Booked By"
                                        placeholder=""
                                        name="booked_by"
                                        value={job.booked_by}
                                        onChange={(e) =>
                                            setJob((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                                        }
                                    />

                                    {isAdmin && (
                                        <CustomInputField
                                            isInput
                                            label="Quoted Price (Buy Price)"
                                            placeholder=""
                                            name="quoted_price"
                                            onChange={(e) =>
                                                setJob((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                                            }
                                        />
                                    )}
                                </SimpleGrid>
                            </Box>

                            <Box flex="1">
                                <Flex justifyContent="space-between" alignItems="flex-start" mb="12px" gap="16px">
                                    <Text fontSize="sm" fontWeight="600" color="gray.600">
                                        Job Requirements
                                    </Text>

                                    {!job?.is_stackable_required && (
                                        <Alert
                                            status="warning"
                                            borderRadius="md"
                                            bg="white"
                                            border="1px solid"
                                            borderColor="orange.300"
                                            maxW="520px"
                                            py="6px"
                                            px="10px"
                                        >
                                            <AlertIcon color="orange.400" boxSize="16px" />
                                            <AlertTitle fontSize="sm" fontWeight="500" color="orange.600">
                                                Non-stackable freight may be subject to a higher rate on the final invoice
                                            </AlertTitle>
                                        </Alert>
                                    )}
                                </Flex>

                                <Flex wrap="wrap" gap="12px" align="center">
                                    <TogglePill
                                        label="Timeslot Required"
                                        isActive={job.is_inbound_connect === true}
                                        onClick={() => {
                                            setJob((prev) => ({
                                                ...prev,
                                                is_inbound_connect: !(prev.is_inbound_connect === true),
                                            }));
                                        }}
                                    />

                                    {(job.job_category_id == 1 || job.job_category_id == 2) &&
                                        job.is_inbound_connect === true && (
                                            <Box minW="270px" mt="4px" height="42px">
                                                <CustomInputField
                                                    isSelect={true}
                                                    showLabel={false}
                                                    optionsArray={filtereddepotOptions}
                                                    value={
                                                        filtereddepotOptions.find(
                                                            (option) => option.value === job.timeslot_depots,
                                                        ) || null
                                                    }
                                                    placeholder="Select a depot"
                                                    onChange={(e) => {
                                                        setRefinedData((prev) => ({
                                                            ...prev,
                                                            timeslot_depots: e.value,
                                                        }));
                                                        setJob((prev) => ({
                                                            ...prev,
                                                            timeslot_depots: e.value,
                                                        }));
                                                    }}
                                                />
                                            </Box>
                                        )}

                                    <TogglePill
                                        label="Hand Unloading"
                                        isActive={job.is_hand_unloading === true}
                                        onClick={() => {
                                            setJob((prev) => ({
                                                ...prev,
                                                is_hand_unloading: !prev.is_hand_unloading,
                                            }));
                                        }}
                                    />

                                    <TogglePill
                                        label="DG Dangerous Goods"
                                        isActive={job.is_dangerous_goods === true}
                                        onClick={() => {
                                            setJob((prev) => ({
                                                ...prev,
                                                is_dangerous_goods: !prev.is_dangerous_goods,
                                            }));
                                        }}
                                    />

                                    <TogglePill
                                        label="Tailgate Required"
                                        isActive={job.is_tailgate_required === true}
                                        onClick={() => {
                                            setJob((prev) => ({
                                                ...prev,
                                                is_tailgate_required: !prev.is_tailgate_required,
                                            }));
                                        }}
                                    />

                                    <TogglePill
                                        label="Hard Copy Paperwork"
                                        isActive={job.is_paperwork_required === true}
                                        onClick={() => {
                                            setJob((prev) => ({
                                                ...prev,
                                                is_paperwork_required: !prev.is_paperwork_required,
                                            }));
                                        }}
                                    />

                                    <TogglePill
                                        label="Non Stackable Freight"
                                        isActive={!job?.is_stackable_required}
                                        onClick={() => {
                                            setJob((prev) => ({
                                                ...prev,
                                                is_stackable_required: !prev.is_stackable_required,
                                            }));
                                        }}
                                    />
                                </Flex>
                            </Box>

                            <Box mb="16px">
                                <h3 className="mb-5 mt-3"> Addresses </h3>


                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="20px">
                                    {/* ---------- Pickup Information ---------- */}
                                    <Box
                                        bg="white"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        borderRadius="12px"
                                        p="20px"
                                    >
                                        <h4 style={{ marginBottom: "20px" }}>Pickup Information</h4>

                                        <JobAddressesSection
                                            savedAddressesSelect={savedAddressesSelect}
                                            defaultJobDestination={pickUpDestination}
                                            entityModel={job}
                                            onAddressSaved={(_hasChanged) => {
                                                getCustomerAddresses();
                                            }}
                                            jobDestinationChanged={(jobDestination) => {
                                                const stateCode = getStateCode(jobDestination.address_state);

                                                setPickUpDestination({
                                                    ...pickUpDestination,
                                                    ...jobDestination,
                                                    ...{ is_pickup: true },
                                                });
                                                // let currentPickupstate =
                                                //     pickUpDestination.address_state == "Victoria"
                                                //         ? "VIC"
                                                //         : pickUpDestination.address_state == "Queensland"
                                                //             ? "QLD"
                                                //             : "";
                                                // const filtereddepotOption = depotOptions.filter(
                                                //     (option) => option.state_code == job.transport_location,
                                                // );
                                                // setFilteredDepotOptions(filtereddepotOption);
                                                setJob((prev) => ({
                                                    ...prev,
                                                    pick_up_lng: jobDestination.lng,
                                                    pick_up_lat: jobDestination.lat,
                                                    pick_up_address: jobDestination.address,
                                                    pick_up_notes: jobDestination.notes,
                                                    pick_up_name: jobDestination.name,
                                                    pick_up_report: jobDestination.report,
                                                    pick_up_state: jobDestination.state,
                                                }));

                                                setRefinedData((prev) => ({
                                                    ...prev,
                                                    ...{
                                                        pick_up_state: jobDestination.state,
                                                        pick_up_stateCode: stateCode,
                                                    },
                                                }));
                                            }}
                                        />
                                    </Box>

                                    {/* ---------- Delivery Information cards — first one sits beside
                                        Pickup, additional ones wrap into new rows, 2 per row ---------- */}
                                    {jobDestinations.map((jobDestination, index) => {
                                        const key = jobDestination?.id ?? `new-${index}`;

                                        return (
                                            <Box
                                                key={key}
                                                bg="white"
                                                border="1px solid"
                                                borderColor="gray.200"
                                                borderRadius="12px"
                                                p="20px"
                                            >
                                                <Flex justifyContent="space-between" alignItems="center" mb="12px">
                                                    <h4 style={{ margin: 0 }}>Delivery Address {index + 1}</h4>
                                                    {jobDestinations.length > 1 && (
                                                        <Button
                                                            bg="white"
                                                            className="!text-[var(--chakra-colors-black-400)] !py-2 !px-3 !h-[unset]"
                                                            onClick={() => handleRemoveFromJobDestinations(index)}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTrashCan}
                                                                className="!text-[var(--chakra-colors-black-400)]"
                                                            />
                                                        </Button>
                                                    )}
                                                </Flex>

                                                <JobAddressesSection
                                                    entityModel={job}
                                                    onAddressSaved={(_hasChanged) => {
                                                        getCustomerAddresses();
                                                    }}
                                                    savedAddressesSelect={savedAddressesSelect}
                                                    defaultJobDestination={jobDestination}
                                                    jobDestinationChanged={(jobDestination) => {
                                                        handleJobDestinationChanged(jobDestination, index);
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </SimpleGrid>

                                <Box mt="16px">
                                    <Button variant="secondary" onClick={() => addToJobDestinations()}>
                                        + Add delivery location
                                    </Button>
                                </Box>


                            </Box>

                            <Divider className="my-3" />
                            <JobUrgencyToggle
                                label="Job Type(Urgency)"
                                optionsArray={
                                    companyStandardStatic
                                        ? jobTypeOptions
                                        : filteredJobTypeOptions
                                }
                                value={
                                    (companyStandardStatic
                                        ? jobTypeOptions
                                        : filteredJobTypeOptions
                                    )?.find((jobType) => jobType.value === job.job_type_id) ||
                                    null
                                }
                                onChange={(e) => {
                                    setJob((prev) => ({
                                        ...prev,
                                        job_type_id: e.value || null,
                                    }));
                                    setRefinedData((prev) => ({
                                        ...prev,
                                        service_choice: e?.label ?? null,
                                    }));
                                }}
                            />
                            <Divider className="my-3" />
                            <Box mb="16px" mt={4}>
                                <Flex justify="space-between" align="center" className="mb-3">
                                    <h3 className="">Items</h3>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            addToJobItems();
                                        }}
                                    >
                                        + Add item
                                    </Button>
                                </Flex>

                                <JobInputTable
                                    columns={itemsTableColumns}
                                    data={jobItems}
                                    optionsSelect={itemTypes}
                                    onRemoveClick={(index) => {
                                        handleRemoveFromJobItems(index);
                                    }}
                                    onValueChanged={handleJobItemChanged}
                                />
                                <Box
                                    mt={4}
                                    p={3}
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    backgroundColor="gray.50"
                                >
                                    <Flex justify="flex-end" align="center" mb={0}>
                                        <Text fontSize="sm" fontWeight="500" color="gray.700" pl={4}>
                                            CBM Auto&nbsp;:&nbsp;
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color="blue.600"
                                            textAlign="right"
                                            pr={4}
                                        >
                                            {isQuotePrice
                                                ? quoteCalculationRes.cbm_auto
                                                : tempcalculation?.cbm_auto || 0}
                                        </Text>
                                    </Flex>

                                    <Flex justify="flex-end" align="center">
                                        <Text fontSize="sm" fontWeight="500" color="gray.700" pl={4}>
                                            Total Weight&nbsp;:&nbsp;
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color="blue.600"
                                            textAlign="right"
                                            pr={4}
                                        >
                                            {isQuotePrice
                                                ? quoteCalculationRes.total_weight
                                                : tempcalculation?.total_weight || 0}
                                        </Text>
                                    </Flex>
                                </Box>
                            </Box>

                            <Divider className="my-2" />

                            <Box mb="16px">
                                <h3 className="mb-3 mt-3">Attachments</h3>
                                <Flex width="100%" className="mb-6">
                                    <FileInput
                                        entity="Job"
                                        entityId={job.id}
                                        onTemporaryUpload={(_temporaryMedia) => {
                                            setTemporaryMedia(_temporaryMedia);
                                        }}
                                        isTemporary={true}
                                        defaulTemporaryFiles={temporaryMedia}
                                        description="Browse or drop your files here to upload"
                                        height="80px"
                                        bg="primary.100"
                                    ></FileInput>
                                </Flex>
                                {temporaryMedia.length >= 0 && (
                                    <PaginationTable
                                        columns={attachmentColumns}
                                        data={temporaryMedia}
                                        total={temporaryMedia.length}
                                        onDelete={(mediaId) => {
                                            handleRemoveFromTemporaryMedia(mediaId);
                                        }}
                                    />
                                )}
                            </Box>

                            <Divider className="my-4" />

                            <Box mb="16px">
                                <h3 className="mb-3 mt-3">Additional Info</h3>

                                {/* Notes row — 3-column, mirrors the reference design's Admin/Base/Company row */}
                                {isAdmin && (
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacingX="32px" spacingY="8px">
                                        <CustomInputField
                                            isTextArea={true}
                                            label="Customer Notes"
                                            placeholder=""
                                            extra="Visible to driver"
                                            name="customer_notes"
                                            value={job.customer_notes}
                                            onChange={(e) =>
                                                setJob((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                                            }
                                        />
                                        <CustomInputField
                                            isTextArea={true}
                                            label="Admin notes"
                                            placeholder="Admin notes"
                                            name="admin_notes"
                                            value={job.admin_notes}
                                            onChange={(e) =>
                                                setJob((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                                            }
                                        />
                                        <CustomInputField
                                            isTextArea={true}
                                            label="Base notes"
                                            placeholder=""
                                            name="base_notes"
                                            value={job.base_notes ? job.base_notes : customerBaseNotes}
                                            onChange={(e) =>
                                                setJob((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                                            }
                                        />
                                    </SimpleGrid>
                                )}

                                {!isAdmin && (
                                    <Box mt="15px">
                                        <CustomInputField
                                            label="Customer Notes"
                                            placeholder=""
                                            extra="Visible to driver"
                                            isTextArea={true}
                                            name="customer_notes"
                                            value={job.customer_notes}
                                            onChange={(e) =>
                                                setJob((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                                            }
                                        />
                                    </Box>
                                )}

                                <Box mb="16px">
                                    <Flex alignItems="flex-start" justifyContent="flex-end" width="100%" pt={7} gap="40px">

                                        {/* ---------- Right: Get A Quote + breakdown card (fixed width) ---------- */}
                                        {(job.job_category_id == 1 || job.job_category_id == 2) &&
                                            (refinedData.pick_up_stateCode === "VIC" ||
                                                refinedData.pick_up_stateCode === "QLD") && (
                                                <Box flexShrink={0} w="320px">
                                                    <Flex justify="flex-end" mb="16px">
                                                        <Button
                                                            variant="outline"
                                                            borderColor="#3b82f6"
                                                            color="#3b82f6"
                                                            borderRadius="8px"
                                                            px={6}
                                                            py={3}
                                                            mr={4}
                                                            fontWeight="500"
                                                            fontSize="sm"
                                                            // isDisabled={!quoteCalculationRes || !quoteCalculationRes.total}
                                                            onClick={() => {
                                                                downloadQuotePdf();
                                                            }}
                                                        >
                                                            Download Quote
                                                        </Button>
                                                        <Button
                                                            bg="#3b82f6"
                                                            color="white"
                                                            _hover={{ bg: "#2563eb" }}
                                                            _active={{
                                                                bg: "#2563eb",
                                                                transform: "scale(0.95)",
                                                            }}
                                                            borderRadius="8px"
                                                            px={6}
                                                            py={3}
                                                            fontWeight="500"
                                                            fontSize="sm"
                                                            onClick={() => {
                                                                sendFreightData();
                                                            }}
                                                        >
                                                            Get A Quote
                                                        </Button>
                                                    </Flex>
                                                    {quoteCalculationRes && quoteCalculationRes.total > 0 && (
                                                        <Box
                                                            bg="white"
                                                            border="1px solid"
                                                            borderColor="gray.200"
                                                            borderRadius="12px"
                                                            p="20px"
                                                        >
                                                            <Stack spacing="10px">
                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Freight
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                                                                        {quoteCalculationRes.freight ?? "—"}
                                                                    </Text>
                                                                </Flex>

                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Fuel Levy
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                                                                        {quoteCalculationRes.fuel ?? "—"}
                                                                    </Text>
                                                                </Flex>

                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Hand Unload
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                                                                        {quoteCalculationRes.hand_unload ?? "—"}
                                                                    </Text>
                                                                </Flex>

                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Time Slot
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                                                                        {quoteCalculationRes.time_slot ?? "—"}
                                                                    </Text>
                                                                </Flex>

                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Tail Lift
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                                                                        {quoteCalculationRes.tail_lift ?? "—"}
                                                                    </Text>
                                                                </Flex>

                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Dangerous Goods
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                                                                        {quoteCalculationRes.dangerous_goods ?? "—"}
                                                                    </Text>
                                                                </Flex>

                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Stackable
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                                                                        {quoteCalculationRes.stackable ?? "—"}
                                                                    </Text>
                                                                </Flex>

                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Toll Levy ({quoteCalculationRes.toll_levy_type ?? "—"})
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                                                                        {quoteCalculationRes.toll_amount ?? "—"}
                                                                    </Text>
                                                                </Flex>

                                                                <Divider my="4px" />

                                                                <Flex justify="space-between">
                                                                    <Text fontSize="sm" fontWeight="700">
                                                                        Total
                                                                    </Text>
                                                                    <Text fontSize="sm" fontWeight="700" color="blue.600">
                                                                        {quoteCalculationRes.total ?? "—"}
                                                                    </Text>
                                                                </Flex>
                                                            </Stack>
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                    </Flex>
                                </Box>
                            </Box>

                            <Divider className="mt-3 mb-3" />

                            <Flex justifyContent="flex-end" className="mb-3">
                                <Button
                                    variant="primary"
                                    onClick={handleJobCreation}
                                    isDisabled={isSaving}
                                >
                                    Create Job
                                </Button>
                            </Flex>
                        </FormControl>
                        <Modal isOpen={isJobCreatedOpen} onClose={onClose} isCentered>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Job Created</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    <Text>Your job has been created successfully!</Text>
                                </ModalBody>
                                <ModalFooter>
                                    <Link href={`/admin/jobs/${newJobId}`}>
                                        <Button as="a" colorScheme="blue" mr={3} onClick={onClose}>
                                            View Job #{newJobId}
                                        </Button>
                                    </Link>

                                    <Link href={`/admin/jobs`}>
                                        <Button as="a" colorScheme="blue" mr={3} onClick={onClose}>
                                            Close
                                        </Button>
                                    </Link>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    </Grid>
                }
            </Grid>
        </Box>
    );
}

export default JobPage;