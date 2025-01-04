import Grid from "@mui/material/Grid";
import CampaignCharts from './Custom/Charts.js';
import MDBox from "components/MDBox";
import TruncatedText from './Custom/ToolTip.js';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";

import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from "../../firebase";
import MDTypography from "../../components/MDTypography";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMaterialUIController } from "../../context";
import { Box, Modal } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Sidenav2 from "../../examples/Sidenav/index2";
import brandDark from "../../assets/images/logo-ct-dark.png";
import brandWhite from "../../assets/images/logo-ct.png";
import routes from "../../routes";

// Initialize Firebase
const db = getFirestore(firebaseApp);

function Dashboard() {
  // Dummy data for app statistics
  const dailyActiveUsers = 1250;
  const monthlyActiveUsers = 10200;
  const retentionRate = 75.3;
  const newSignups = 450;
  const averageSessionDuration = "5m 30s"; // Example duration
  const churnRate = 8.2; // Example churn rate in percentage
  const totalRevenue = 15000; // Example revenue in USD
  const errorRate = 2.5; // Example error rate in percentage
  const [conversionData, setConversionData] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const fetchConversionData = async () => {
      try {
        // Fetch data for "Users"
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersCount = usersSnapshot.size;

        // Fetch data for "Universities"
        const universitiesCollection = collection(db, "Universities");
        const universitiesSnapshot = await getDocs(universitiesCollection);
        const universitiesCount = universitiesSnapshot.size;

        // Fetch data for "Events"
        const eventsCollection = collection(db, "Events");
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsCount = eventsSnapshot.size;

        // Fetch data for "Clubs"
        const clubsCollection = collection(db, "Clubs");
        const clubsSnapshot = await getDocs(clubsCollection);
        const clubsCount = clubsSnapshot.size;

        // Update conversionData state
        setConversionData([usersCount, universitiesCount, eventsCount, clubsCount]);
      } catch (error) {
        console.error("Error fetching conversion data:", error);
      }
    };

    fetchConversionData();
  }, []);

  const isDesktop = useMediaQuery('(min-width: 1024px)'); // Adjust breakpoint as per your requirements
  const [open, setOpen] = useState(false);

  // Handlers to open and close modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox
          mx={2}
          mt={-3}
          mb={5}
          py={3}
          px={2}
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <MDTypography variant="h6" color="white">
            Dashboard
          </MDTypography>
          {/* Menu icon to open the sidenav */}
          {!isDesktop && (
            <MenuIcon
              style={{ cursor: "pointer", color: "white" }}
              onClick={handleOpen}
            />
          )}
        </MDBox>
        <Grid container spacing={3}>
          {/* Cards for App Statistics */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="groups"
                title="Total Users"
                count={conversionData[0]}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="calendar_month"
                title="Total Universities"
                count={conversionData[1]}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="thumb_up"
                title="Total Clubs"
                count={conversionData[3]}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="secondary"
                icon="person_add"
                title="Total Events"
                count={conversionData[2]}
              />
            </MDBox>
          </Grid>
          {/*<Grid item xs={12} md={6} lg={3}>*/}
          {/*  <MDBox mb={1.5}>*/}
          {/*    <ComplexStatisticsCard*/}
          {/*      color="warning"*/}
          {/*      icon="access_time"*/}
          {/*      title="Avg. Session Duration"*/}
          {/*      count={averageSessionDuration}*/}
          {/*    />*/}
          {/*  </MDBox>*/}
          {/*</Grid>*/}
          
          {/* New Additional Cards */}
          {/*<Grid item xs={12} md={6} lg={3}>*/}
          {/*  <MDBox mb={1.5}>*/}
          {/*    <ComplexStatisticsCard*/}
          {/*      color="error"*/}
          {/*      icon="trending_down"*/}
          {/*      title="Churn Rate"*/}
          {/*      count={`${churnRate.toFixed(1)}%`}*/}
          {/*    />*/}
          {/*  </MDBox>*/}
          {/*</Grid>*/}
          {/*<Grid item xs={12} md={6} lg={3}>*/}
          {/*  <MDBox mb={1.5}>*/}
          {/*    <ComplexStatisticsCard*/}
          {/*      color="success"*/}
          {/*      icon="attach_money"*/}
          {/*      title="Total Revenue"*/}
          {/*      count={`$${totalRevenue.toFixed(2)}`}*/}
          {/*    />*/}
          {/*  </MDBox>*/}
          {/*</Grid>*/}
          {/*<Grid item xs={12} md={6} lg={3}>*/}
          {/*  <MDBox mb={1.5}>*/}
          {/*    <ComplexStatisticsCard*/}
          {/*      color="dark"*/}
          {/*      icon="error_outline"*/}
          {/*      title="Error Rate"*/}
          {/*      count={`${errorRate.toFixed(1)}%`}*/}
          {/*    />*/}
          {/*  </MDBox>*/}
          {/*</Grid>*/}

          {/* Placeholder for Campaign Charts */}
          <CampaignCharts />
        </Grid>

      </MDBox>



      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Sidenav component */}
          <Sidenav2
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Material Dashboard 2"
            routes={routes}
          />
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
