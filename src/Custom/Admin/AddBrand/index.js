import React, { useEffect, useState } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getFirestore, collection, addDoc, query, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firebaseApp } from '../../../firebase.js';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";
import { v4 as uuidv4 } from 'uuid';


const db = getFirestore(firebaseApp);

const BrandForm = () => {
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const brandsCollection = collection(db, 'brand_details');
      const brandsSnapshot = await getDocs(query(brandsCollection));
      const brandsList = brandsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBrands(brandsList);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    if (!newBrandName) return;

    setLoading(true);
    try {
      if (selectedBrand) {
        const brandDoc = doc(db, 'brand_details', selectedBrand.id);
        await setDoc(brandDoc, { ...selectedBrand, name: newBrandName }, { merge: true });
        alert("Brand updated successfully!");
      } else {
        const brandId = uuidv4();
        const brandDoc = doc(db, 'brand_details', brandId);
        await setDoc(brandDoc, {
            name: newBrandName,
            dateCreated: new Date().toISOString(),
            users: [],
            campaigns: [],
            id: brandId,
          });
        alert("Brand added successfully!");
      }
      fetchBrands();
      setNewBrandName('');
      setSelectedBrand(null);
    } catch (error) {
      console.error("Error adding/updating brand:", error);
    }
    setLoading(false);
  };

  const handleBrandDelete = async (brandId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this brand?");
    if (!confirmDelete) return;

    try {
      const brandDoc = doc(db, 'brand_details', brandId);
      await deleteDoc(brandDoc);
      alert("Brand deleted successfully!");
      fetchBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setNewBrandName(brand.name);
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
                Add or Edit Brand
              </MDTypography>
            </MDBox>
            <MDBox p={3}>
              <form onSubmit={handleBrandSubmit}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Enter brand name"
                  required
                  sx={{ marginBottom: 2 }}
                />
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="success"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "Processing..." : selectedBrand ? "Update Brand" : "Add Brand"}
                </MDButton>
              </form>

              <Grid container spacing={3} mt={2}>
                {brands.map((brand) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={brand.id}>
                    <Card>
                      <MDBox p={2} onClick={() => handleBrandSelect(brand)} sx={{ cursor: 'pointer' }}>
                        <MDTypography variant="h6">{brand.name}</MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="flex-end" p={1}>
                        <IconButton
                          color="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBrandSelect(brand);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBrandDelete(brand.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
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

export default BrandForm;
