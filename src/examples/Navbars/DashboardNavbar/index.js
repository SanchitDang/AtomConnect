import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { admins } from '../../../admin';
import { useAuth } from '../../../AuthContext';
import { useGlobalState } from "../../../GlobalStateContext"; // Import global state management

import { Card } from '@mui/material';
function DashboardNavbar({ absolute, light, isMini }) {
  const { currentUser } = useAuth();
  const { setGlobalBrandsData } = useGlobalState(); // Access global state setter
  const isAdmin = admins.includes(currentUser.email);
  
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [durations, setDurations] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  // Fetch and filter brands based on user privileges
  useEffect(() => {
    const fetchBrands = async () => {
      const brandsCollection = collection(db, 'brand_details');
      let brandsList = [];
      const brandNameToIdMap = {}; // Map to hold brand names and their corresponding IDs
  
      // Fetch all brands from brand_details collection
      const brandsSnapshot = await getDocs(brandsCollection);
      brandsSnapshot.forEach(doc => {
        const brandData = { id: doc.id, ...doc.data() };
        brandsList.push(brandData);
        brandNameToIdMap[brandData.name] = doc.id; // Map brand name to brand ID
      });
  
      if (isAdmin) {
        // If admin, we can directly use the fetched brands
        setBrands(brandsList);
      } else {
        const userBrandsDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userBrandsDoc.exists()) {
          const userBrands = userBrandsDoc.data().brands || []; // This contains brand names
  
          // Convert brand names to IDs using the mapping created
          const userBrandIds = userBrands.map(brandName => brandNameToIdMap[brandName]).filter(Boolean); // Filter out any undefined IDs
  
          // Now, filter the brands based on the IDs found
          brandsList = brandsList.filter(brand => userBrandIds.includes(brand.id));
          setBrands(brandsList);
        }
      }
  
      // Automatically select the first brand and its details
      if (brandsList.length > 0) {
        const initialBrand = brandsList[0];
        setSelectedBrand(initialBrand.id);
        setCampaigns(initialBrand.campaigns);
        if (initialBrand.campaigns.length > 0) {
          setSelectedCampaign(initialBrand.campaigns[0]);
          setDurations(initialBrand[initialBrand.campaigns[0]]);
          if (initialBrand[initialBrand.campaigns[0]].length > 0) {
            setSelectedDuration(initialBrand[initialBrand.campaigns[0]][0]);
            try {
              const dataRef = doc(db, `brands/${initialBrand.id}/${initialBrand.campaigns[0]}/${initialBrand[initialBrand.campaigns[0]][0]}`);
              const dataDoc = await getDoc(dataRef);
              if (dataDoc.exists()) {
                setGlobalBrandsData(dataDoc.data());  // Store fetched data in global state
                console.log("Data saved globally:", dataDoc.data());
              } else {
                console.log('No data found');
              }
            } catch (error) {
              console.error("Error fetching brands data:", error);
            }
          }
        }
      }
    };
    fetchBrands();
  }, [currentUser.uid, isAdmin]);
  
  // Update campaigns and durations when a new brand is selected
  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrand(brandId);
    const brand = brands.find(b => b.id === brandId);
    setCampaigns(brand?.campaigns || []);
    if (brand?.campaigns?.length) {
      setSelectedCampaign(brand.campaigns[0]);
      setDurations(brand[brand.campaigns[0]]);
      setSelectedDuration(brand[brand.campaigns[0]][0] || '');
    }
  };

  const handleCampaignChange = (e) => {
    const campaign = e.target.value;
    setSelectedCampaign(campaign);
    const brand = brands.find(b => b.id === selectedBrand);
    const campaignDurations = brand?.[campaign] || [];
    setDurations(campaignDurations);
    setSelectedDuration(campaignDurations[0] || '');
  };

  const formatDuration = (duration) => {
    const [start, end] = duration.split("_");
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.getDate()} ${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} to ${endDate.getDate()} ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`;
  };

  // Submit and store selected data in global state
  const handleSubmit = async () => {
    
    try {
      const dataRef = doc(db, `brands/${selectedBrand}/${selectedCampaign}/${selectedDuration}`);
      const dataDoc = await getDoc(dataRef);
      if (dataDoc.exists()) {
        setGlobalBrandsData(dataDoc.data());  // Store fetched data in global state
      console.log("Data saved globally:", dataDoc.data());
      } else {
        console.log('No data found');
      }
      // const brandsDataSnapshot = await getDocs(collection(db, 'brands', selectedBrand, selectedCampaign, selectedDuration ));
      // const allBrandsData = brandsDataSnapshot.docs.map(doc => doc.data());
      
    } catch (error) {
      console.error("Error fetching brands data:", error);
    }
  };

  return (
    <div></div>
    // <AppBar position={absolute ? "absolute" : "sticky"} color="white">
      // <Card style={{ padding:'5px' }}>
      // <Toolbar>
      //   <MDBox display="flex" alignItems="center" width="100%">
      //     <MDBox flex={1}>
      //       <Breadcrumbs icon="home" title="Dashboard" />
      //     </MDBox>
      //     <MDBox display="flex" gap={2}>
      //       <TextField
      //         select
      //         label="Select Brand"
      //         value={selectedBrand}
      //         onChange={handleBrandChange}
      //         fullWidth
      //         sx={{
      //           width: 200,
      //           minWidth: 200,
      //           '& .MuiOutlinedInput-root': { height: 40 }
      //         }}
      //       >
      //         {brands.map(brand => (
      //           <MenuItem key={brand.id} value={brand.id}>
      //             {brand.name}
      //           </MenuItem>
      //         ))}
      //       </TextField>
      //       <TextField
      //         select
      //         label="Campaign"
      //         value={selectedCampaign}
      //         onChange={handleCampaignChange}
      //         disabled={!campaigns.length}
      //         fullWidth
      //         sx={{
      //           width: 200,
      //           minWidth: 200,
      //           '& .MuiOutlinedInput-root': { height: 40 }
      //         }}
      //       >
      //         {campaigns.map(campaign => (
      //           <MenuItem key={campaign} value={campaign}>
      //             {campaign}
      //           </MenuItem>
      //         ))}
      //       </TextField>
      //       <TextField
      //         select
      //         label="Duration"
      //         value={selectedDuration}
      //         onChange={(e) => setSelectedDuration(e.target.value)}
      //         disabled={!durations.length}
      //         fullWidth
      //         sx={{
      //           width: 200,
      //           minWidth: 200,
      //           '& .MuiOutlinedInput-root': { height: 40 }
      //         }}
      //       >
      //         {durations.map(duration => (
      //           <MenuItem key={duration} value={duration}>
      //             {formatDuration(duration)}
      //           </MenuItem>
      //         ))}
      //       </TextField>
      //       <MDButton
      //         onClick={handleSubmit}
      //         variant="gradient"
      //         color="info"
      //         fullWidth
      //       >
      //         Submit
      //       </MDButton>
      //     </MDBox>
      //   </MDBox>
      // </Toolbar>
      // </Card>
    // </AppBar>
  );
}

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
