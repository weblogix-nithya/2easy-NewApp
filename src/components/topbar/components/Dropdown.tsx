import { RootState } from "@/lib/store/store";
import { INavItem } from "@/lib/types/navigation";
import { isSecondLevelActive } from "@/utils/navigation";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Flex, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";

export function DropdownItem({ item, level = 1 }: { item: INavItem; level?: number }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const openTimeout = useRef<NodeJS.Timeout | null>(null);
    const closeTimeout = useRef<NodeJS.Timeout | null>(null);

    const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
    const isCustomer = useSelector((state: RootState) => state.user.isCustomer);
    const isCompany = useSelector((state: RootState) => state.user.isCompany);
    const isSubAdmin = useSelector((state: RootState) => state.user.isSubAdmin);

    const hasChildren = item.children && item.children.length > 0;
    const isActive = isSecondLevelActive(item, pathname)

    const canRenderRoute = (route: INavItem) =>  (isAdmin || (isSubAdmin && route.key !== "pendingrcti") || (isCustomer && !["draft", "create"].includes(route.key)));

    console.log("Role",isAdmin,isSubAdmin,isCustomer)
    // Smooth Hover
    const handleMouseEnter = () => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }

        openTimeout.current = setTimeout(() => {
            setOpen(true);
        }, 100); // open delay (ms)
    };

    const handleMouseLeave = () => {
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
            openTimeout.current = null;
        }

        closeTimeout.current = setTimeout(() => {
            setOpen(false);
        }, 150); // close delay (ms)
    };


    if (!hasChildren) {
        return (
            <MenuItem
                as={Link}
                href={item.href ?? (item.layout + item.path || "#")}
                bg={isActive ? "navy.600" : "#5b6bd5"}
                _hover={{ bg: "navy.600" }}
                _focus={{ bg: "navy.600" }}
                fontWeight={level == 1 && "semibold"}
            >
                {item.name}
            </MenuItem>
        );
    }

    return (
        <Menu placement={"right-start"} isOpen={open} gutter={0} >
            <MenuButton
                as={Flex}
                role="menuitem"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                // className="flex justify-between items-center"
                // bg="#5b6bd5"
                bg={isActive || open ? "navy.600" : "#5b6bd5"}
                _hover={{ bg: "navy.600" }}
                // _active={{ bg: "navy.600" }}
                _focus={{ bg: "navy.600" }}
                px={3}
                py={2}
                fontSize="md"
                fontWeight={level == 1 && "semibold"}
                lineHeight="1.2"
                cursor="pointer"
            >
                <Flex w="100%" align="center" justify="space-between">
                    <span>
                        {isAdmin ? (item.path === "/jobs" ? "Bulk Allocation" : item.name) : (isCompany ? (item.path === "/jobs" ? "My Bookings" : item.name) : item.name)}
                    </span>
                    <ChevronRightIcon
                        transform={open ? "rotate(90deg)" : "rotate(0deg)"}
                        transition="transform 0.2s"
                    />
                </Flex>
            </MenuButton>

            <MenuList
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                bg="#5b6bd5"
                minW="120px"
                opacity={open ? 1 : 0}
                transform={open ? "translateY(0)" : "translateY(-2px)"}
                transition="opacity 0.12s ease, transform 0.12s ease"
            >
                {item.children!
                    .filter((child) => canRenderRoute(child))
                    .map((child) => (
                    <DropdownItem key={child.name} item={child} level={level + 1} />
                ))}
            </MenuList>
        </Menu>
    );
}