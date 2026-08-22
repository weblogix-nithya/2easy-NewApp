"use client";

import { useMutation } from "@apollo/client/react";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Input,
  SimpleGrid,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { Select } from "chakra-react-select";
import { AttachmentIcon } from "@chakra-ui/icons";

import PrivateAccessModal from "@/components/modal/PrivateAccessModal";
import { TabsComponent } from "@/components/tabs/TabsComponet";

// import { SEND_GROUP_EMAIL } from "@/graphql/jobCcEmails";
import { GET_COMPANYS_QUERY } from "@/graphql/company";
import { GET_ALL_CUSTOMERS_QUERY, SEND_GROUP_EMAIL_MUTATION } from "@/graphql/customer";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

// @ts-ignore
import "react-quill-new/dist/quill.snow.css";

// @ts-ignore
import "react-quill-new/dist/quill.bubble.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

interface SendGroupEmailResult {
  sendGroupEmail: {
    success: boolean;
    message: string;
    count: number;
  };
}

type OptionType = {
  value: string;
  label: string;
};

const RECIPIENT_TYPE_OPTIONS: OptionType[] = [
  { value: "all", label: "All Customers" },
  { value: "role", label: "By Role" },
  { value: "company", label: "By Company" },
];

// Matches App\Enums\RoleEnum
const ROLE_OPTIONS: OptionType[] = [
  // { value: "Super Admin", label: "Super Admin" },
  // { value: "Organisation Admin", label: "Sub Admin" },
  // { value: "Organisation Manager", label: "Organisation Manager" },
  // { value: "User", label: "User" },
  // { value: "Driver", label: "Driver" },
  { value: "Customer", label: "Customer" },
  { value: "Company Admin", label: "Company Admin" },
];

export default function BulkEmailPage() {
  const { isAdmin } = useSelector((state: RootState) => state.user);

  const pathname = usePathname();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // --------------------------------------------------
  // Basic email state
  // --------------------------------------------------
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // --------------------------------------------------
  // Recipient state
  // --------------------------------------------------
  const [recipientType, setRecipientType] = useState<OptionType>(RECIPIENT_TYPE_OPTIONS[0]);
  const [selectedRole, setSelectedRole] = useState<OptionType | null>(null);
  const [companyOptions, setCompanyOptions] = useState<OptionType[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<OptionType | null>(null);

  // --------------------------------------------------
  // Customer state
  // --------------------------------------------------
  const [customerOptions, setCustomerOptions] = useState<OptionType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string[]>([]);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);

  // --------------------------------------------------
  // Attachments
  // --------------------------------------------------
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // --------------------------------------------------
  // Tabs
  // --------------------------------------------------
  const staticTabs = [
    { id: 1, name: "Bulk Email", tabName: "Bulk Email", hash: "bulk_email" },
  ];

  const [tabs, _setTabs] = useState(staticTabs);
  const [_tabId, setActiveTab] = useState(isAdmin === true ? 1 : 2);

  // --------------------------------------------------
  // Private route modal
  // --------------------------------------------------
  const isPrivateRoute = useSelector(
    (state: RootState) =>
      state.routes.routes.find((route) => route.layout + route.path === pathname)
        ?.isPrivate || false,
  );

  useEffect(() => {
    if (isPrivateRoute && isAdmin) {
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrivateRoute]);

  // --------------------------------------------------
  // Company API
  // --------------------------------------------------
  const [getCompanys] = useApolloLazyQueryWithEffect(GET_COMPANYS_QUERY, {
    onCompleted: (data: any) => {
      setCompanyOptions(
        data.companys.data.map((_entity: any) => ({
          value: String(_entity.id),
          label: _entity.name,
        })),
      );
    },
    onError: (error) => {
      toast({
        title: "Could not load companies",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {
    if (recipientType.value !== "company") {
      return;
    }

    getCompanys({
      variables: {
        query: "",
        page: 1,
        first: 100,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientType.value]);

  // --------------------------------------------------
  // ALL CUSTOMERS API
  //
  // This replaces:
  // GET_CUSTOMERS_QUERY
  // GET_CUSTOMERS_BY_ROLE_QUERY
  // --------------------------------------------------
  const [getAllCustomers] = useApolloLazyQueryWithEffect(
    GET_ALL_CUSTOMERS_QUERY,
    {
      onCompleted: (data: any) => {
        const customers = data?.allCustomers || [];

        const options = customers
          .filter((customer: any) => customer.email)
          .map((customer: any) => ({
            value: String(customer.id),
            label: `${customer.full_name} - ${customer.email}`,
          }));

        setCustomerOptions(options);

        // For All Customers, automatically select everyone.
        if (recipientType.value === "all") {
          const ids = options.map((option) => option.value);
          setSelectedCustomer(ids);
          setSelectAllCustomers(ids.length > 0);
        }
      },
      onError: (error) => {
        toast({
          title: "Could not load customers",
          description: error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      },
    },
  );

  // --------------------------------------------------
  // Load customers based on recipient type
  // --------------------------------------------------
  useEffect(() => {
    /*
     * ALL CUSTOMERS
     *
     * Backend allCustomers requires role.
     * "Customer" is used here because
     * this screen is for customer emails.
     */
    if (recipientType.value === "all") {
      setSelectedRole(null);
      setSelectedCompany(null);
      setSelectedCustomer([]);
      setSelectAllCustomers(false);

      getAllCustomers({
        variables: {
          role: "All",
          orderBy: [{ column: "id", order: "ASC" }],
          query: "",
          company_id: undefined,
          is_approved: undefined,
        },
      });

      return;
    }

    /*
     * BY ROLE
     */
    if (recipientType.value === "role" && selectedRole) {
      setSelectedCustomer([]);
      setSelectAllCustomers(false);

      getAllCustomers({
        variables: {
          role: selectedRole.value,
          orderBy: [{ column: "id", order: "ASC" }],
          query: "",
          company_id: undefined,
          is_approved: undefined,
        },
      });

      return;
    }

    /*
     * BY COMPANY
     *
     * Company filter + Customer role.
     */
    if (recipientType.value === "company" && selectedCompany) {
      setSelectedCustomer([]);
      setSelectAllCustomers(false);

      getAllCustomers({
        variables: {
          role: "All",
          orderBy: [{ column: "id", order: "ASC" }],
          query: "",
          company_id: selectedCompany.value,
          is_approved: undefined,
        },
      });

      return;
    }
  }, [recipientType.value, selectedRole, selectedCompany, getAllCustomers]);

  // --------------------------------------------------
  // Reset when recipient type changes
  // --------------------------------------------------
  useEffect(() => {
    setSelectedRole(null);
    setSelectedCompany(null);
    setCustomerOptions([]);
    setSelectedCustomer([]);
    setSelectAllCustomers(false);
  }, [recipientType.value]);

  // --------------------------------------------------
  // Select all customers
  // --------------------------------------------------
  const handleSelectAllCustomers = (checked: boolean) => {
    setSelectAllCustomers(checked);

    if (checked) {
      setSelectedCustomer(customerOptions.map((option) => option.value));
    } else {
      setSelectedCustomer([]);
    }
  };

  // --------------------------------------------------
  // Individual customer selection
  // --------------------------------------------------
  const handleCustomerChange = (selectedOptions: any) => {
    const values = (selectedOptions || []).map((option: OptionType) => option.value);

    setSelectedCustomer(values);
    setSelectAllCustomers(
      customerOptions.length > 0 && values.length === customerOptions.length,
    );
  };

  // --------------------------------------------------
  // Send Bulk Email
  // --------------------------------------------------
  const [sendGroupEmail, { loading }] = useMutation<SendGroupEmailResult>(
    SEND_GROUP_EMAIL_MUTATION,
    {
      onCompleted: (data) => {
        if (data.sendGroupEmail.success) {
          toast({
            title: "Email queued successfully!",
            description: data.sendGroupEmail.message,
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          setSubject("");
          setBody("");
          setAttachments([]);
          setRecipientType(RECIPIENT_TYPE_OPTIONS[0]);
          setSelectedRole(null);
          setSelectedCompany(null);
          setCustomerOptions([]);
          setSelectedCustomer([]);
          setSelectAllCustomers(false);
        } else {
          toast({
            title: "Failed to send email.",
            description: data.sendGroupEmail.message,
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      },
    },
  );

  // --------------------------------------------------
  // Validate
  // --------------------------------------------------
  const isReadyToSend = (() => {
    if (!subject.trim() || !body.trim()) {
      return false;
    }

    if (selectedCustomer.length === 0) {
      return false;
    }

    return true;
  })();

  // --------------------------------------------------
  // Send
  // --------------------------------------------------
  const handleSend = () => {
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!body.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedCustomer.length === 0) {
      toast({
        title: "No customers selected",
        description: "Please select at least one customer.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    sendGroupEmail({
      variables: {
        subject: subject.trim(),
        body,
        customerIds: selectedCustomer.map((id) => Number(id)),
        attachments: attachments.length > 0 ? attachments : undefined,
      },
    });
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <>
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <SimpleGrid
          mb="20px"
          pt="32px"
          px="24px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          <Flex minWidth="max-content" justifyContent="space-between">
            <h1 className="mb-0">Bulk Email</h1>
          </Flex>
        </SimpleGrid>
      </Box>

      <SimpleGrid className="text-sm text-center font-bold border-b border-[var(--chakra-colors-gray-200)]">
        <Flex className="pl-5">
          <TabsComponent tabs={tabs} onChange={(tabId) => setActiveTab(tabId)} />
        </Flex>
      </SimpleGrid>

      <Box pt="0px">
        <SimpleGrid
          mb="20px"
          pt="16px"
          px="24px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          <Flex direction="column" gap="16px">
            {/* --------------------------------------- */}
            {/* Recipient filters */}
            {/* --------------------------------------- */}
            <Flex gap="16px" alignItems="flex-end" flexWrap="wrap">
              {/* Send To */}
              <Box minW="220px">
                <Text fontSize="sm" fontWeight="500" mb="6px">
                  Send To
                </Text>

                <Select
                  value={recipientType}
                  options={RECIPIENT_TYPE_OPTIONS}
                  onChange={(option) => {
                    if (option) {
                      setRecipientType(option);
                    }
                  }}
                  menuPosition="fixed"
                  menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                />
              </Box>

              {/* Role */}
              {recipientType.value === "role" && (
                <Box minW="220px">
                  <Text fontSize="sm" fontWeight="500" mb="6px">
                    Role
                  </Text>

                  <Select
                    value={selectedRole}
                    options={ROLE_OPTIONS}
                    onChange={(option) => setSelectedRole(option)}
                    placeholder="Select role"
                    menuPosition="fixed"
                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                  />
                </Box>
              )}

              {/* Company */}
              {recipientType.value === "company" && (
                <Box minW="260px">
                  <Text fontSize="sm" fontWeight="500" mb="6px">
                    Company
                  </Text>

                  <Select
                    value={selectedCompany}
                    options={companyOptions}
                    onChange={(option) => setSelectedCompany(option)}
                    placeholder="Select company"
                    menuPosition="fixed"
                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                  />
                </Box>
              )}
            </Flex>

            {/* --------------------------------------- */}
            {/* Customer loading */}
            {/* --------------------------------------- */}
            {customerOptions.length > 0 && (
              <Box width="full" minW="660px" minHeight="100px">
                {/* <FormLabel>Customer</FormLabel> */}

                <Checkbox
                  isChecked={selectAllCustomers}
                  onChange={(e) => handleSelectAllCustomers(e.target.checked)}
                  mb={2}
                >
                  Select all customers
                </Checkbox>

                <Select
                  placeholder="Customer"
                  options={customerOptions}
                  isMulti
                  size="lg"
                  className="bulk-mail select mb-0"
                  classNamePrefix="two-easy-select"
                  onChange={(selectedOptions) => handleCustomerChange(selectedOptions)}
                  isClearable={true}
                  menuPosition="fixed"
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  value={customerOptions.filter((option) =>
                    selectedCustomer.includes(option.value)
                  )}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "42px",
                      height: "42px",
                      maxHeight: "42px",
                      overflow: "hidden",
                    }),

                    valueContainer: (base) => ({
                      ...base,
                      height: "40px",
                      maxHeight: "40px",
                      overflowY: "auto",
                      overflowX: "hidden",
                      flexWrap: "wrap",
                      alignContent: "flex-start",
                    }),

                    multiValue: (base) => ({
                      ...base,
                      flexShrink: 0,
                    }),

                    indicatorsContainer: (base) => ({
                      ...base,
                      height: "40px",
                    }),
                  }}
                />
              </Box>
            )}
          </Flex>

          <Divider className="!my-0 !py-0" />

          {/* --------------------------------------- */}
          {/* Email Content */}
          {/* --------------------------------------- */}
          <Box
            maxW="1800px"
            minW="1500px"
            px={6}
            py={4}
            bg="white"
            borderRadius="md"
            boxShadow="sm"
            mt={4}
          >
            <Flex gap={8} align="stretch">
              {/* ----------------------------------- */}
              {/* Editor */}
              {/* ----------------------------------- */}
              <Box flex="1" minW="600px" maxW="900px" display="flex" flexDirection="column">
                <Text fontSize="xl" fontWeight="extrabold" mb={2}>
                  Email Content
                </Text>

                <Box flex="1" display="flex" flexDirection="column" minW="400px" maxW="700px">
                  <Input
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    mb={3}
                    size="lg"
                  />

                  <Box mb={3} flex="1">
                    <ReactQuill
                      theme="snow"
                      value={body}
                      onChange={(html) => setBody(html)}
                      style={{ height: "300px", marginBottom: "40px" }}
                    />
                  </Box>

                  {/* Attachments */}
                  <Flex direction="column" mb={3} gap={2}>
                    <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilesSelected} />

                    <Button
                      leftIcon={<AttachmentIcon />}
                      size="sm"
                      variant="outline"
                      alignSelf="flex-start"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Attach files
                    </Button>

                    {attachments.length > 0 && (
                      <Flex wrap="wrap" gap={2}>
                        {attachments.map((file, index) => (
                          <Tag
                            key={`${file.name}-${index}`}
                            size="md"
                            borderRadius="full"
                            variant="subtle"
                            colorScheme="blue"
                          >
                            <TagLabel maxW="200px" isTruncated>
                              {file.name}
                            </TagLabel>

                            <TagCloseButton onClick={() => removeAttachment(index)} />
                          </Tag>
                        ))}
                      </Flex>
                    )}
                  </Flex>

                  {/* Send */}
                  <Button
                    colorScheme="blue"
                    onClick={handleSend}
                    isLoading={loading}
                    isDisabled={!isReadyToSend}
                    alignSelf="flex-start"
                  >
                    Send Email
                  </Button>
                </Box>
              </Box>

              {/* ----------------------------------- */}
              {/* Preview */}
              {/* ----------------------------------- */}
              <Box flex="1" minW="600px" maxW="900px" display="flex" flexDirection="column">
                <Text fontSize="xl" fontWeight="extrabold" mb={2}>
                  Preview
                </Text>

                <Box
                  flex="1"
                  minW="600px"
                  maxW="900px"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={4}
                  bg="gray.50"
                  display="flex"
                  flexDirection="column"
                  height="100%"
                >
                  <Input
                    placeholder="Subject"
                    value={`Subject: ${subject}`}
                    mb={3}
                    size="lg"
                    isReadOnly
                  />

                  <Text color="gray.500" mb={2} fontWeight="bold">
                    Hello!
                  </Text>

                  <Box
                    flex="1"
                    color="gray.800"
                    fontSize="md"
                    mb={2}
                    minHeight="200px"
                    sx={{
                      p: { marginBottom: "8px" },
                      ul: { paddingLeft: "20px" },
                    }}
                  >
                    {body ? (
                      <ReactQuill value={body} readOnly={true} theme="bubble" />
                    ) : (
                      <Text color="gray.400">[Your message will appear here]</Text>
                    )}
                  </Box>

                  {attachments.length > 0 && (
                    <Text color="gray.500" fontSize="sm" mb={2}>
                      📎 {attachments.length} attachment{attachments.length > 1 ? "s" : ""}
                    </Text>
                  )}

                  <Text color="gray.500" fontWeight="bold">
                    Regards,
                  </Text>

                  <Text color="gray.500" fontWeight="bold">
                    2easy
                  </Text>
                </Box>
              </Box>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>

      <PrivateAccessModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}