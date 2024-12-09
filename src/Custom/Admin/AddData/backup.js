import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../../../firebase.js';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

const db = getFirestore(firebaseApp);

const DataUploadForm = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedBrandName, setSelectedBrandName] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overwriteConfirmation, setOverwriteConfirmation] = useState(false);

  useEffect(() => {
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
    fetchBrands();
  }, []);

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrand(brandId);
    const selected = brands.find(brand => brand.id === brandId);
    setSelectedBrandName(selected.name);
    setCampaigns(selected ? selected.campaigns || [] : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBrand || !selectedCampaign || !startDate || !endDate || !file) {
      alert("Please fill in all fields.");
      return;
    }
    await uploadData(file);
  };

  const preprocessData = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const processedData = {};
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (jsonData.length < 2) return;

            const headers = jsonData[0];
            const dataEntries = jsonData.slice(1)
              .map(row => {
                const entry = {};
                row.forEach((cell, index) => {
                  if (cell !== undefined && cell !== null && cell !== '') {
                    entry[headers[index]] = cell;
                  }
                });
                return Object.keys(entry).length > 0 ? entry : null;
              })
              .filter(entry => entry);

            if (dataEntries.length > 0) {
              processedData[sheetName] = dataEntries;
            }
          });

          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadData = async (file) => {
    setIsProcessing(true);
    const dateRangeEntry = `${startDate}_${endDate}`;
    const dateRangeRef = doc(db, 'brands', selectedBrand, selectedCampaign, dateRangeEntry); // Now has an odd number of segments
    const brandDocRef = doc(db, 'brand_details', selectedBrand);

    try {
        // Check if data already exists in this path
        const existingDataDoc = await getDoc(dateRangeRef);

        if (existingDataDoc.exists() && !overwriteConfirmation) {
            const confirmOverwrite = window.confirm("Data already exists for this campaign and date range. Do you want to overwrite it?");
            if (!confirmOverwrite) {
                setIsProcessing(false);
                return;
            } else {
                setOverwriteConfirmation(true);
            }
        }

        let data = await preprocessData(file);
        if (Array.isArray(data)) data = { entries: data };

        // Set the data at the dateRangeRef path directly
        await setDoc(dateRangeRef, data);

        // Update brand details with date range entry
        const brandDoc = await getDoc(brandDocRef);
        const brandData = brandDoc.exists() ? brandDoc.data() : {};
        const existingEntries = brandData[selectedCampaign] || [];

        if (!existingEntries.includes(dateRangeEntry)) {
            existingEntries.push(dateRangeEntry);
            await setDoc(brandDocRef, { [selectedCampaign]: existingEntries }, { merge: true });
        }

        alert('Data uploaded successfully');
    } catch (error) {
        console.error("Error uploading data:", error);
        alert("Failed to upload data. Please try again.");
    } finally {
        setIsProcessing(false);
        setOverwriteConfirmation(false);
    }
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
                Upload Campaign Data
              </MDTypography>
            </MDBox>
            <MDBox p={3}>
              <form onSubmit={handleSubmit}>
                <TextField
                  select
                  label="Brand Name"
                  fullWidth
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  required
                  InputProps={{ style: { minHeight: '45px', marginBottom: 20 } }}
                  InputLabelProps={{ style: { fontSize: '1rem', padding: '0 8px' } }}
                  SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                >
                  <MenuItem value="" disabled>Select a brand</MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id} style={{ padding: '12px 16px' }}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Campaign"
                  fullWidth
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  required
                  InputProps={{ style: { minHeight: '45px', marginBottom: 20 } }}
                  InputLabelProps={{ style: { fontSize: '1rem', padding: '0 8px' } }}
                  SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                >
                  <MenuItem value="" disabled>Select a campaign</MenuItem>
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign} value={campaign} style={{ padding: '12px 16px' }}>
                      {campaign}
                    </MenuItem>
                  ))}
                </TextField>

                <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Date"
                      type="date"
                      fullWidth
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Upload Excel"
                  type="file"
                  fullWidth
                  onChange={(e) => setFile(e.target.files[0])}
                  sx={{ marginBottom: 2 }}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                <MDButton
                  type="submit"
                  variant="gradient"
                  color="success"
                  fullWidth
                  disabled={isProcessing || !selectedBrand || !selectedCampaign || !startDate || !endDate || !file}
                >
                  {isProcessing ? 'Uploading...' : 'Submit'}
                </MDButton>
              </form>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default DataUploadForm;
