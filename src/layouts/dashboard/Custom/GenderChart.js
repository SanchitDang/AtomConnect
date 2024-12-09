/* eslint-disable react/prop-types */
import React from 'react';
import { FaMale, FaFemale } from 'react-icons/fa';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

const GenderChart = ({ genderData }) => {
  const maleData = genderData.find(item => item.Gender === 'Male') || { Click: 0 };
  const femaleData = genderData.find(item => item.Gender === 'Female') || { Click: 0 };
  const totalClicks = maleData.Click + femaleData.Click;

  const malePercentage = ((maleData.Click / totalClicks) * 100).toFixed(0);
  const femalePercentage = ((femaleData.Click / totalClicks) * 100).toFixed(0);

  // Number of icons for each gender based on percentage
  const totalIcons = 100;
  const femaleIconCount = Math.round((femalePercentage / 100) * totalIcons);
  const maleIconCount = totalIcons - femaleIconCount;

  return (
    <Card style={{ height: '350px', display: 'flex',
                 }}>
      <CardContent>
      <Typography mb={5} variant="h6">Gender-wise Performance</Typography>
        <Grid container alignItems="center" style={{marginLeft: '20px' 
                 }}>
          {/* Icon Grid Representation */}
          <Grid item xs={8} >
            <Box display="grid" gridTemplateColumns="repeat(10, 1fr)" gap={1}>
              {/* Female Icons */}
              {Array.from({ length: femaleIconCount }).map((_, i) => (
                <FaFemale key={i} size={17} color="#FF6F61" />
              ))}
              {/* Male Icons */}
              {Array.from({ length: maleIconCount }).map((_, i) => (
                <FaMale key={i + femaleIconCount} size={17} color="#4285F4" />
              ))}
            </Box>
          </Grid>

          {/* Percentage Stats */}
          <Grid item xs={4} style={{ textAlign: 'center' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              {/* Female Stat */}
              <Box display="flex" alignItems="center" marginBottom={2}>
                <FaFemale size={60} color="#FF6F61" />
                <Typography variant="h4" style={{ color: '#FF6F61', marginLeft: 8 }}>{femalePercentage}%</Typography>
              </Box>
              {/* Male Stat */}
              <Box display="flex" alignItems="center">
                <FaMale size={60} color="#4285F4" />
                <Typography variant="h4" style={{ color: '#4285F4', marginLeft: 8 }}>{malePercentage}%</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GenderChart;
