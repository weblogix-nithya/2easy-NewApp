"use client"
// Chakra imports
import { Box, Grid } from "@chakra-ui/react";
// Assets
// import banner from "img/auth/banner.png";
// import avatar from "img/avatars/avatar4.png";
// import AdminLayout from "@/layouts/admin";
// import dynamic from "next/dynamic";
import { parseCookies } from "nookies";
import { useEffect } from "react";
// Custom components
// import Banner from "views/admin/profile/components/Banner";

// const Banner = dynamic(() => import("views/admin/profile/components/Banner"), {
//   ssr: false
// });
export default function ProfileOverview() {
  const cookies = parseCookies();
  // const [userName, setUserName] = useState("-");
  // const [userEmail, setUserEmail] = useState("-");

  useEffect(() => {
    // setUserName(cookies.user_name ? cookies.user_name : "-");
    // setUserEmail(cookies.user_email ? cookies.user_email : "-");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.user_name, cookies.user_email]);

  return (
    // <AdminLayout>
      <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
        {/* Main Fields */}
        <Grid
          templateColumns={{
            base: "1fr",
            lg: "1.34fr 1fr 1.62fr",
          }}
          templateRows={{
            base: "repeat(3, 1fr)",
            lg: "1fr",
          }}
          gap={{ base: "20px", xl: "20px" }}
        >
          {/* <Banner
            gridArea="1 / 1 / 2 / 2"
            banner={banner.src}
            avatar={avatar.src}
            name={userName}
            email={userEmail}
            posts="-"
            followers="-"
            following="-"
          /> */}
        </Grid>
      </Box>
    // </AdminLayout>
  );
}
