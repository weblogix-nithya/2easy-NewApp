// chakra imports
import { Flex, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
type tabContent = {
  id: number;
  tabName: string;
  hash: string;
  isVisible?: boolean;
}[];

export function TabsComponent(props: {
  tabs: tabContent;
  onChange: (tabId: number) => void;
}) {
  const { tabs, onChange } = props;
  // const textColor = useColorModeValue("navy.700", "white");
  // tabs behave
  const [tabId, setActiveTab] = useState(1); // 1 = pending, 2 = active, 4 = inactive
  useEffect(() => {
    validateHash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const validateHash = () => {
    if (window.location.hash) {
      const tab = tabs.find(
        (tab) => tab.hash === window.location.hash.slice(1),
      );
      if (tab) {
        setActiveTab(tab.id);
      }
    } else {
      setActiveTab(1);
    }
  };

  useEffect(() => {
    window.addEventListener("popstate", validateHash);
    return () => {
      window.removeEventListener("popstate", validateHash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    onChange(tabId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId]);
  return (
    <>
      <SimpleGrid className="text-sm text-center font-bold border-b border-[var(--chakra-colors-gray-200)]">
        <Flex className=" -mb-px">
          {tabs.map((tab, index) => (
            <Flex className="mr-2" key={index} hidden={tab.isVisible == false}>
              <a
                href={"#" + tab.hash}
                className={
                  "inline-block p-4 pb-2  border-b-4 " +
                  (tabId == tab.id
                    ? "text-[var(--chakra-colors-primary-400)] border-[var(--chakra-colors-primary-400)] active"
                    : "text-[var(--chakra-colors-black-500)] border-transparent hover:text-[var(--chakra-colors-black-500)]  hover:border-gray-300")
                }
                onClick={() => setActiveTab(tab.id)}
                aria-current="page"
              >
                {tab.tabName}
              </a>
            </Flex>
          ))}
        </Flex>
      </SimpleGrid>
    </>
  );
}
