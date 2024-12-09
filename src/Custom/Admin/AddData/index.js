import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, updateDoc  } from 'firebase/firestore';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedBrand || !file) {
      alert("Please fill in all required fields and upload the Excel file.");
      return;
    }
  
    try {
      const data = await preprocessData(file);
      const performingHoursSheet = data['Performing Hours'];
      const campaignSheet = data['Campaign'];
  
      if (!performingHoursSheet || !performingHoursSheet[0]?.Campaign) {
        alert('Campaign data is missing in the "Performing Hours" sheet.');
        return;
      }
  
      if (!campaignSheet || !campaignSheet.some(entry => entry.Date)) {
        alert('Date entries are missing in the "Campaign" sheet.');
        return;
      }
  
      const selectedCampaign = performingHoursSheet[0].Campaign;
      const dates = campaignSheet.map(entry => new Date(entry.Date)).sort((a, b) => a - b);
  
      const startDate = dates[0]?.toISOString().split('T')[0];
      const endDate = dates[dates.length - 1]?.toISOString().split('T')[0];
  
      if (!startDate || !endDate) {
        alert('Invalid dates in the "Campaign" sheet.');
        return;
      }
  
      // Remove conflicting collections within the specified duration
      await removeConflictingCollections(selectedBrand, startDate, endDate);
  
      await uploadData(file, selectedBrand, selectedCampaign, startDate, endDate);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process the Excel file. Please try again.');
    }
  };
  
  const removeConflictingCollections = async (brandId, startDate, endDate) => {
    try {
      const brandRef = collection(db, 'brands', brandId);
      const snapshots = await getDocs(brandRef);
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      snapshots.forEach((doc) => {
        const [docStart, docEnd] = doc.id.split('_').map(date => new Date(date));
        if (
          (docStart >= start && docStart <= end) ||
          (docEnd >= start && docEnd <= end) ||
          (docStart <= start && docEnd >= end)
        ) {
          // Delete conflicting collection
          const conflictingDocRef = doc(db, `brands/${brandId}/${doc.id}`);
          setDoc(conflictingDocRef, {}, { merge: false });
        }
      });
    } catch (error) {
      console.error('Error removing conflicting collections:', error);
    }
  };
  
  const uploadData = async (file) => {
    if (!selectedBrand || !file) {
      alert("Please fill in all fields.");
      return;
    }
  
    setIsProcessing(true);
  
    try {
      const data = await preprocessData(file);
  
      if (!data["Performing Hours"] || !data["Campaign"]) {
        alert("Missing required sheets: 'Performing Hours' or 'Campaign'");
        setIsProcessing(false);
        return;
      }
  
      const campaignSheet = data["Performing Hours"];
      const durationSheet = data["Campaign"];
  
      const campaignName = campaignSheet[0]?.Campaign;
      if (!campaignName) {
        alert("Campaign name is missing in 'Performing Hours' sheet.");
        setIsProcessing(false);
        return;
      }
  
      const dates = durationSheet.map((row) => row.Date);
      if (dates.length === 0) {
        alert("No dates found in 'Campaign' sheet.");
        setIsProcessing(false);
        return;
      }
  
      // Convert Excel date to JavaScript date
      const excelDateToJSDate = (serial) => {
        // Excel's epoch starts on 1899-12-30, add serial days to it.
        const excelEpochStart = new Date(1900, 0, 1);;
        const jsDate = new Date(excelEpochStart.getTime() + (serial - 2) * 86400000); // Subtract 1 to correct for Excel's leap year bug
        return new Date(jsDate.toISOString().split("T")[0]); // Ensure UTC and strip time.
      };
      
      const sortedDates = dates.map(excelDateToJSDate).sort((a, b) => a - b);
      const startDate = sortedDates[0].toISOString().split("T")[0];
      const endDate = sortedDates[sortedDates.length - 1].toISOString().split("T")[0];
  
      const dateRangeEntry = `${startDate}_${endDate}`;
      const dateRangeRef = doc(db, 'brands', selectedBrand, campaignName, dateRangeEntry);
  
      // Delete overlapping ranges
      const campaignsRef = collection(db, 'brands', selectedBrand, campaignName);
      const allDocs = await getDocs(campaignsRef);
  
      const overlappingDocs = allDocs.docs.filter(doc => {
        const [existingStart, existingEnd] = doc.id.split('_');
        return !(endDate < existingStart || startDate > existingEnd);
      });
  
      await Promise.all(overlappingDocs.map((doc) => doc.ref.delete()));
  
      // Save new data
      await setDoc(dateRangeRef, data);
  
      // Update brand details
      const brandDocRef = doc(db, 'brand_details', selectedBrand);
      const brandData = await getDoc(brandDocRef);
      const existingEntries = brandData.exists() ? brandData.data()[campaignName] || [] : [];
      
      const updatedCampaigns = [...campaigns, campaignName];
      console.log(updatedCampaigns);
      await updateDoc(brandDocRef, { campaigns: updatedCampaigns });
      if (!existingEntries.includes(dateRangeEntry)) {
        existingEntries.push(dateRangeEntry);

        await setDoc(brandDocRef, { [campaignName]: existingEntries }, { merge: true });
      }
      
      alert('Data uploaded successfully');
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("Failed to upload data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  

  return (
    <MDBox pt={6} pb={3} >
      <Grid container spacing={60}>
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

                {/* <TextField
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
                </TextField> */}

                {/* <Grid container spacing={2} sx={{ marginBottom: 2 }}>
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
                </Grid> */}

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
                  disabled={isProcessing || !selectedBrand || !file}
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
