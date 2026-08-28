import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  GridItem,
  Link,
  SimpleGrid,
  Skeleton,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { formatCurrency } from "@/lib/helpers/helper";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export default function InvoiceTab(props: { jobObject: any }) {
  const { jobObject } = props;
  const toast = useToast();

  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  const isCustomer = useSelector((state: RootState) => state.user.isCustomer);
  const isSubAdmin = useSelector((state: RootState) => state.user.isSubAdmin);
  const isAdminUser = isAdmin || isSubAdmin;
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecodary = useColorModeValue("#888888", "#888888");
  const [job, setJob] = React.useState<any>(jobObject);
  const job_collection = jobObject.job_destinations?.find(
    (dest: any) => dest.is_pickup,
  )?.address_city;
  const job_delivery = jobObject.job_destinations?.find(
    (dest: any) => !dest.is_pickup,
  )?.address_city;

  useEffect(() => {
    let _customer = null;

    if (
      !isAdminUser &&
      (jobObject.customer_invoice == undefined ||
        jobObject.customer_invoice?.invoice_status_id == 1)
    ) {
      window.location.href = "/admin/jobs/" + jobObject.id;
    }

    if (
      jobObject.customer_invoice &&
      jobObject.customer_invoice.customer &&
      !jobObject.customer_invoice.customer?.full_name
    ) {
      _customer = {
        ...jobObject.customer_invoice.customer,
        full_name:
          jobObject.customer_invoice.customer?.first_name +
          " " +
          jobObject.customer_invoice.customer?.last_name,
      };
    }
    setJob({
      ...jobObject,
      customer_invoice: {
        ...jobObject.customer_invoice,
        customer: _customer ? _customer : jobObject.customer_invoice?.customer,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobObject]);

  return (
    <Box mt={5}>
      <Box mb={10} mt={10} width="">
        <Flex mb={1} align="flex-start">
          <Box>
            <SimpleGrid columns={{ sm: 1 }} ml={5}>
              <GridItem>
                <Text
                  fontWeight="800!"
                  ms="2px"
                  mr={5}
                  mt={0}
                  textColor={textColor}
                >
                  Customer
                </Text>
                <Text fontWeight="800!" fontSize="sm" color={"blue.500"}>
                  {job?.customer_invoice?.customer?.full_name}
                </Text>
              </GridItem>
              <GridItem>
                <Text
                  fontSize="xs"
                  fontWeight="400"
                  mt={1}
                  textColor={textColorSecodary}
                >
                  {job?.customer_invoice?.customer?.company?.name}
                </Text>
              </GridItem>
            </SimpleGrid>
          </Box>
          <Box ml="600px" textAlign="start">
            <Text fontSize="sm" fontWeight="800" color="gray.600">
              Collection: {job_collection}
            </Text>
            <Text fontSize="sm" fontWeight="800" color="gray.600">
              Delivery: {job_delivery}
            </Text>
          </Box>
        </Flex>
      </Box>
      <Divider />

      <Box mb={10} mt={10} width="">
        <Flex mb={1}>
          <Text fontWeight="800!" ms="2px" mr={10} mt={0} textColor={textColor}>
            Invoice
          </Text>
        </Flex>
        <Flex mb={1}>
          <Table>
            <Thead>
              <Tr>
                <Th>Description</Th>
                <Th>Rate</Th>
                <Th>QTY</Th>
                <Th colSpan={2} textAlign="end">
                  AMOUNT
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {!job?.customer_invoice?.invoice_line_items ? (
                <Tr>
                  <Td colSpan={5}>
                    <Center py={4}>
                      <Spinner size="lg" />
                    </Center>
                  </Td>
                </Tr>
              ) : (
                job?.customer_invoice?.invoice_line_items?.map(
                  (item: any, index: number) => (
                    <Tr key={"row-" + index}>
                      <Td>{item.name}</Td>
                      <Td>{formatCurrency(item.unit_amount, item.currency)}</Td>
                      <Td>{item.quantity}</Td>
                      <Td colSpan={2} textAlign="end">
                        {formatCurrency(item.line_amount, item.currency)}
                      </Td>
                    </Tr>
                  ),
                )
              )}
            </Tbody>
          </Table>
        </Flex>

        <Flex className="w-full mt-4 gap-6" justifyContent="space-between">
          <Box className="w-1/2 max-w-[400px] space-y-2 py-2">
            <p className="text-md">
              <span className="text-sm !font-bold px-1">
                Total Weight:{" "}
              </span>
              {job?.job_items
                ?.reduce(
                  (total: number, item: { weight: number }) =>
                    total + (item.weight || 0),
                  0,
                )
                .toFixed(2)}
            </p>

            <p className="text-md">
              <span className="text-sm !font-bold px-1">CBM: </span>
              {job?.job_items
                ?.reduce(
                  (total: number, item: { volume: number }) =>
                    total + (item.volume || 0),
                  0,
                )
                .toFixed(2)}
            </p>
          </Box>
          <Box className="w-1/2 mt-4">
            <Box className="max-w-[400px] ml-auto">
              <Flex flexDirection="column" className="ml-auto">
                <Flex
                  justifyContent="space-between"
                  className="py-4 border-b border-[#e3e3e3]"
                >
                  <Skeleton isLoaded={job.customer_invoice} w="50%">
                    <p className="text-sm !font-bold">SubTotal </p>
                  </Skeleton>
                  <Skeleton isLoaded={job.customer_invoice} w="50%">
                    <p className="text-sm text-right">
                      {job?.customer_invoice?.sub_total
                        ? formatCurrency(
                          job.customer_invoice?.sub_total,
                          job.customer_invoice?.currency,
                        )
                        : "$0"}
                    </p>
                  </Skeleton>
                </Flex>
                <Flex
                  justifyContent="space-between"
                  className="py-4 border-b border-[#e3e3e3]"
                >
                  <Skeleton isLoaded={job.customer_invoice} w="50%">
                    <p className="text-sm !font-bold">GST (10%) </p>
                  </Skeleton>
                  <Skeleton isLoaded={job.customer_invoice} w="50%">
                    <p className="text-sm text-right">
                      {job.customer_invoice?.total_tax
                        ? formatCurrency(
                          job.customer_invoice?.total_tax,
                          job.customer_invoice?.currency,
                        )
                        : "$0"}
                    </p>
                  </Skeleton>
                </Flex>
                <Flex
                  justifyContent="space-between"
                  className="py-4 border-b border-[#e3e3e3]"
                >
                  <Skeleton isLoaded={job.customer_invoice} w="50%">
                    <p className="text-sm !font-bold">Total </p>
                  </Skeleton>
                  <Skeleton isLoaded={job.customer_invoice} w="50%">
                    <p className="text-sm text-right">
                      {job.customer_invoice?.total
                        ? formatCurrency(
                          job.customer_invoice?.total,
                          job.customer_invoice?.currency,
                        )
                        : "$0"}
                    </p>
                  </Skeleton>
                </Flex>
                <Flex
                  justifyContent="space-between"
                  className="py-4 border-b border-[#e3e3e3]"
                >
                  <Skeleton isLoaded={job.customer_invoice} w="50%">
                    <p className="text-base !font-bold">Balance Due </p>
                  </Skeleton>
                  <Skeleton isLoaded={job.customer_invoice} w="50%">
                    <p className="text-base !font-bold text-right">
                      {job.customer_invoice?.total
                        ? formatCurrency(
                          job.customer_invoice?.total,
                          job.customer_invoice?.currency,
                        )
                        : "$0"}
                    </p>
                  </Skeleton>
                </Flex>
              </Flex>

              <Flex flexDirection="column" className="ml-auto">
                <Flex justifyContent="space-between"></Flex>
                <SimpleGrid minWidth={"35vw"}>
                  {!isCustomer && (
                    <Box>
                      <GridItem>
                        <Text fontWeight="800!" fontSize="md" mt={7}>
                          Approval
                        </Text>
                        <Text fontWeight="500" fontSize="sm" mt={7}>
                          Approve invoice to send a copy to your company
                          accounts email
                        </Text>
                      </GridItem>
                    </Box>
                  )}
                </SimpleGrid>
              </Flex>

              <Flex justifyContent="space-between" className="mt-8">
                <Button
                  mr={2}
                  hidden={isCustomer}
                  variant="primary"
                  className="w-[49%]"
                  onClick={() =>
                    toast({
                      title: "TODO: Approve Invoice",
                      status: "error",
                    })
                  }
                >
                  Approve Invoice
                </Button>
                <Button
                  mr={2}
                  hidden={true}
                  variant="primary"
                  className="w-[49%]"
                  onClick={() =>
                    toast({
                      title: "TODO: Resend to Accounts",
                      status: "error",
                    })
                  }
                >
                  Resend to Accounts
                </Button>

                {job.invoice_url != null && (
                  <Link href={job.invoice_url} mr={2} isExternal className="w-[49%]">
                    <Button variant="secondary" className="w-[100%]">
                      Download Invoice
                    </Button>
                  </Link>
                )}

                {jobObject.customer_invoice != null && (
                  <Link
                    href={`/admin/invoices/${jobObject.customer_invoice.id}`}
                    className="w-[49%]"
                  >
                    <Button
                      hidden={!isAdminUser}
                      variant="primary"
                      className="w-[100%]"
                    >
                      Edit Invoice
                    </Button>
                  </Link>
                )}
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}