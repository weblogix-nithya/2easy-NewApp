import { RootState } from "@/lib/store/store";
import { INavItem, IRouteNew } from "@/lib/types/navigation";
import { isSecondLevelActive } from "@/utils/navigation";
import { Menu, MenuButton, MenuList } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { DropdownItem } from "./components/Dropdown";

interface TopbarProps {
    routes: IRouteNew[];
}

export default function TobNavbar(props: TopbarProps) {

    const { routes } = props;
    const pathname = usePathname();
    const [openKey, setOpenKey] = useState<string | null>(null);
    const openTimeout = useRef<NodeJS.Timeout | null>(null);
    const closeTimeout = useRef<NodeJS.Timeout | null>(null);

    const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
    const isCustomer = useSelector((state: RootState) => state.user.isCustomer);
    // const isCompany = useSelector((state: RootState) => state.user.isCompany);

    const isHeaderActive = (route:IRouteNew) => route.children?.some((child) => isSecondLevelActive(child, pathname));
    const canRenderRoute = (route:INavItem) => (route.layout === "/admin" || route.layout === "/auth") && (isAdmin || (isCustomer && route.isCompany === true));
    const canRenderHeaderRoute = (route:IRouteNew) => (isAdmin || (isCustomer && route.isCompany === true));

    // Smooth Hover
    const handleMouseEnter = (key: string) => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }

        openTimeout.current = setTimeout(() => {
            setOpenKey(key);
        }, 100); // open delay (ms)
    };

    const handleMouseLeave = () => {
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
            openTimeout.current = null;
        }

        closeTimeout.current = setTimeout(() => {
            setOpenKey(null);
        }, 150); // close delay (ms)
    };

    return (
        <nav className="bg-newNavy px-6 py-2 flex gap-6 justify-around items-center">
            {routes
                .filter((item) => canRenderHeaderRoute(item))
                .map((item) => (
                    <Menu key={item.key} isOpen={openKey === item.key} placement={"bottom"} >
                        <MenuButton
                            onMouseEnter={() => handleMouseEnter(item.key)}
                            onMouseLeave={handleMouseLeave}
                            className="font-medium text-white hover:text-gray-200 uppercase"
                            position="relative"
                            _after={{
                                content: '""',
                                position: "absolute",
                                left: "50%",
                                bottom: "-4px",
                                width: isHeaderActive(item) || openKey === item.key ? "100%" : "0",
                                height: "2px",
                                bg: "white",
                                transform: "translateX(-50%)",
                                transition: "width 0.3s ease",
                            }}
                            _hover={{
                                _after: { width: "100%" },
                            }}
                        >
                            {item.name}
                        </MenuButton>

                        {item.children && (
                            <MenuList
                                onMouseEnter={() => handleMouseEnter(item.key)}
                                onMouseLeave={handleMouseLeave}
                                color="white"
                                bg="#5b6bd5"
                                minW={{ base: "180px", md: "220px" }}
                                transform={openKey === item.key ? "translateY(0)" : "translateY(-2px)"}
                                opacity={openKey === item.key ? 1 : 0}
                                transition="opacity 0.12s ease, transform 0.12s ease"
                            >
                                {item.children
                                    .filter((child) => canRenderRoute(child))
                                    .map((child) => (
                                        <DropdownItem key={child.name} item={child} />
                                    ))}
                            </MenuList>
                        )}
                    </Menu>
                ))}
        </nav>
    );
}
