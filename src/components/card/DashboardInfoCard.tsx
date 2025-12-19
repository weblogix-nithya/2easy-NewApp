// Chakra imports
import { Divider, Flex } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DashboardInfoCard(props: {
  title: string;
  quantity: string;
  icon: any;
  iconBgColor: string;
  children?: React.ReactNode;
}) {
  const { title, quantity, icon, iconBgColor, children } = props;

  return (
    <div className="p-5 rounded-lg !bg-[#f3f8ff]">
      <Flex justifyContent="space-between" alignItems="center">
        <div>
          <p className="mb-1 text-sm !font-bold">{title}</p>
          <h2>{quantity}</h2>
        </div>
        <Flex
          className="h-[48px] w-[48px] rounded-full"
          alignItems="center"
          justifyContent="center"
          sx={{
            backgroundColor: iconBgColor,
          }}
        >
          <FontAwesomeIcon icon={icon} color="#ffffff" />
        </Flex>
      </Flex>

      <Divider className="mt-4" />

      {children}
    </div>
  );
}
