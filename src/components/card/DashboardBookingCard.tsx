// Chakra imports
import { Button, Flex, Image, Link } from "@chakra-ui/react";

export default function DashboardBookingCard(props: {
  image: string;
  title: string;
  linkText: string;
  link: string;
}) {
  const { image, title, linkText, link } = props;

  return (
    <div className="flex items-center py-4 px-6 w-[400px] max-w-[400px] h-[140px] rounded-3xl bg-[var(--chakra-colors-primary-200)]">
      <div>
        <Image src={image} alt="" className="h-[108px] w-[108px] mr-6" />
      </div>

      <Flex flexDirection="column" alignItems="flex-start">
        <h3 className="mb-4">{title}</h3>
        <Button variant="primary">
          <Link href={link}>{linkText}</Link>
        </Button>
      </Flex>
    </div>
  );
}
