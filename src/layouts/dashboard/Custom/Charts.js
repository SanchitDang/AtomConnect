import React, {useEffect, useState} from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement } from 'chart.js';
import { Card, CardContent, Typography, Grid } from '@mui/material';

import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from "../../../firebase";
// Register necessary components for Chart.js
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement);

const db = getFirestore(firebaseApp);
const CampaignCharts = () => {
  // Dummy data simulating an app's performance metrics
  const dateLabels = ["01/10/2024", "02/10/2024", "03/10/2024", "04/10/2024", "05/10/2024"];
  const clicksData = [120, 200, 150, 300, 250];
  const impressionsData = [1500, 2500, 2000, 3200, 2800];
  const spendData = [50, 75, 60, 90, 85];
  const ctrData = clicksData.map((clicks, idx) => ((clicks / impressionsData[idx]) * 100).toFixed(2));
  const conversionRateData = [5.2, 6.8, 7.1, 8.3, 7.9];
  const retentionRateData = [72, 68, 70, 75, 73];

  const dateWiseData = {
    labels: dateLabels,
    datasets: [
      { label: 'Clicks', data: clicksData, borderColor: 'rgba(255,99,132,1)', fill: false },
      { label: 'CTR (%)', data: ctrData, borderColor: 'rgba(75,192,192,1)', fill: false },
      { label: 'Spend ($)', data: spendData, borderColor: 'rgba(153,102,255,1)', fill: false },
      { label: 'Impressions', data: impressionsData, borderColor: 'rgba(255,159,64,1)', fill: false },
    ],
  };

  const ageLabels = ["18-24", "25-34", "35-44", "45+"];
  const ageClicks = [400, 300, 200, 100];
  const ageImpressions = [5000, 4000, 3000, 2000];
  const ageCTR = ageClicks.map((clicks, idx) => ((clicks / ageImpressions[idx]) * 100).toFixed(2));

  const agePerformanceData = {
    labels: ageLabels,
    datasets: [
      { label: 'Clicks', data: ageClicks, backgroundColor: '#E91E63' },
      { label: 'Impressions', data: ageImpressions, backgroundColor: '#3F51B5' },
      { label: 'CTR (%)', data: ageCTR, backgroundColor: '#FFC107' },
    ],
  };

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weekdayEngagementData = [320, 280, 300, 340, 360];
  const weekdaySessionsData = [500, 480, 510, 530, 550];

  const weekdayPerformanceData = {
    labels: weekdayLabels,
    datasets: [
      { label: 'Engagements', data: weekdayEngagementData, backgroundColor: 'rgba(255,99,132,0.2)', borderColor: 'rgba(255,99,132,1)', fill: true, tension: 0.4 },
      { label: 'Sessions', data: weekdaySessionsData, backgroundColor: 'rgba(75,192,192,0.2)', borderColor: 'rgba(75,192,192,1)', fill: true, tension: 0.4 },
    ],
  };

  const conversionLabels = ["Users", "Universities", "Events"];
  // const conversionData = [75, 20, 5];
  const [conversionData, setConversionData] = useState([0, 0, 0]);

  useEffect(() => {
    const fetchConversionData = async () => {
      try {
        // Fetch Users
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersCount = usersSnapshot.size;

        // Fetch Universities
        const universitiesCollection = collection(db, "Universities");
        const universitiesSnapshot = await getDocs(universitiesCollection);
        const universitiesCount = universitiesSnapshot.size;

        // Fetch Events
        const eventsCollection = collection(db, "Events");
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsCount = eventsSnapshot.size;

        // Update conversionData state
        setConversionData([usersCount, universitiesCount, eventsCount]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchConversionData();
  }, []);

  const conversionBreakdownData = {
    labels: conversionLabels,
    datasets: [
      { label: 'User Type Breakdown', data: conversionData, backgroundColor: ['#4CAF50', '#FFC107', '#E91E63'] },
    ],
  };

  return (
    <Grid container spacing={3}>
      {/* Date-wise Clicks/CTR/Spend/Impressions */}
      {/*<Grid item xs={12}>*/}
      {/*  <Card style={{ height: '400px' }}>*/}
      {/*    <CardContent style={{ height: '350px', overflow: 'hidden' }}>*/}
      {/*      <Typography variant="h6">Date-wise Clicks, CTR, Spend & Impressions</Typography>*/}
      {/*      <div style={{ height: '300px' }}>*/}
      {/*        <Line data={dateWiseData} options={{ maintainAspectRatio: false }} />*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</Grid>*/}

      {/* Age Group Performance */}
      {/*<Grid item xs={12} md={6}>*/}
      {/*  <Card style={{ height: '400px' }}>*/}
      {/*    <CardContent>*/}
      {/*      <Typography variant="h6">Age Group Performance</Typography>*/}
      {/*      <Bar data={agePerformanceData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</Grid>*/}

      {/* Weekday Engagement & Sessions */}
      {/*<Grid item xs={12} md={6}>*/}
      {/*  <Card style={{ height: '350px' }}>*/}
      {/*    <CardContent>*/}
      {/*      <Typography variant="h6">Weekday-wise Engagement & Sessions</Typography>*/}
      {/*      <div style={{ height: '300px' }}>*/}
      {/*        <Line data={weekdayPerformanceData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</Grid>*/}

      {/* User Type Breakdown (Conversion) */}
      <Grid item xs={12} md={6}>
        <Card style={{ height: '350px', overflow: 'hidden' }}>
          <CardContent>
            <Typography variant="h6">Classification</Typography>
            <div style={{ height: '270px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie data={conversionBreakdownData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Additional KPI (Conversion & Retention Rates) */}
      {/*<Grid item xs={12}>*/}
      {/*  <Card style={{ height: '400px' }}>*/}
      {/*    <CardContent style={{ height: '350px', overflow: 'hidden' }}>*/}
      {/*      <Typography variant="h6">Date-wise Conversion Rate & Retention Rate</Typography>*/}
      {/*      <div style={{ height: '300px' }}>*/}
      {/*        <Line*/}
      {/*          data={{*/}
      {/*            labels: dateLabels,*/}
      {/*            datasets: [*/}
      {/*              { label: 'Conversion Rate (%)', data: conversionRateData, borderColor: '#FF5722', fill: false },*/}
      {/*              { label: 'Retention Rate (%)', data: retentionRateData, borderColor: '#3F51B5', fill: false },*/}
      {/*            ],*/}
      {/*          }}*/}
      {/*          options={{ maintainAspectRatio: false }}*/}
      {/*        />*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</Grid>*/}
    </Grid>
  );
};

export default CampaignCharts;
