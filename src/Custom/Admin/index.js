import React, { useEffect } from 'react';
import { useAuth } from '../../AuthContext.js';
import { admins } from '../../admin.js';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";
import AddCampaign from "./AddCampaign";
import AddBrand from "./AddBrand";
import AddData from "./AddData";
import Users from "./Users";
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useGlobalState } from "../../GlobalStateContext";

const Admin = () => {
  const { currentUser, logout } = useAuth(); // Get current user and logout function
  const navigate = useNavigate(); // Use navigate hook
  const { globalBrandsData, setGlobalBrandsData } = useGlobalState();

  useEffect(() => {
    // Check if the current user is an admin
    if (!admins.includes(currentUser.email)) {
      navigate("/dashboard"); // Redirect to /dashboard if not an admin
    }
    
    // Optional: log global brands data for debugging
    console.log(globalBrandsData);
  }, [currentUser, navigate]); // Include currentUser and navigate in dependencies

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container spacing={3}> {/* gap adds space between components */}
      <Grid item xs={12} md={6}>
      <AddBrand />  </Grid>
      <Grid item xs={12} md={6}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AddData />
      </LocalizationProvider>
      </Grid>
    </Grid>
      <Users />
    </DashboardLayout>
  );
};

export default Admin;
