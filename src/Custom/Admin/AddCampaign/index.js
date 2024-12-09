import React, { useEffect, useState } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { getFirestore, collection, doc, updateDoc, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../../firebase.js';
import MDButton from "components/MDButton";

const db = getFirestore(firebaseApp);

const CampaignForm = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch all brands from Firestore
  const fetchBrands = async () => {
    try {
      const brandsCollection = collection(db, 'brand_details');
      const brandsSnapshot = await getDocs(brandsCollection);
      const brandsList = brandsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBrands(brandsList);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  // Fetch campaigns for selected brand
  const fetchCampaigns = async (brandId) => {
    const selected = brands.find((brand) => brand.id === brandId);
    setCampaigns(selected ? selected.campaigns || [] : []);
  };

  // Handle brand selection
  const handleBrandSelect = (event) => {
    const brandId = event.target.value;
    setSelectedBrand(brandId);
    fetchCampaigns(brandId);
  };

  // Add campaign to the selected brand
  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    if (!newCampaignName || !selectedBrand) return;

    setLoading(true);
    try {
      const brandDoc = doc(db, 'brand_details', selectedBrand);
      const updatedCampaigns = [...campaigns, newCampaignName];
      await updateDoc(brandDoc, { campaigns: updatedCampaigns });
      alert("Campaign added successfully!");

      setCampaigns(updatedCampaigns); // Update local campaigns state
      setNewCampaignName('');
    } catch (error) {
      console.error("Error adding campaign:", error);
    }
    setLoading(false);
  };

  return (
    <MDBox pt={6} pb={3}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h6" color="white">
                Add Campaign to Brand
              </MDTypography>
            </MDBox>
            <MDBox p={3}>
              <form onSubmit={handleCampaignSubmit}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
  <InputLabel sx={{ top: '-5px', fontSize: '1rem' }}>Select Brand</InputLabel>
  <Select
    value={selectedBrand}
    onChange={handleBrandSelect}
    label="Select Brand"
    required
    sx={{ height: 40}}
  >
    {brands.map((brand) => (
      <MenuItem key={brand.id} value={brand.id}>
        {brand.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

                <TextField
                  variant="outlined"
                  fullWidth
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                  required
                  sx={{ mb: 2 }}
                />
                
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="success"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Add Campaign"}
                </MDButton>
              </form>

              <Grid container spacing={3} mt={3}>
                {campaigns.map((campaign, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <MDBox p={2}>
                        <MDTypography variant="h6">{campaign}</MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default CampaignForm;
