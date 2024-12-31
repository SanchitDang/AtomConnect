import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from "../../../firebase.js";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PostModal from "../Posts";

import useMediaQuery from '@mui/material/useMediaQuery';
const db = getFirestore(firebaseApp);
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import Sidenav from "../../../examples/Sidenav";
import { Box, Modal } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import brandDark from "../../../assets/images/logo-ct-dark.png";
import brandWhite from "../../../assets/images/logo-ct.png";
import routes from "../../../routes";
import { useMaterialUIController } from "../../../context";
import Sidenav2 from "../../../examples/Sidenav/index2";

// Material Dashboard 2 React routes
const ClubsTable = () => {
  const [users, setUsers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editedData, setEditedData] = useState({});

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

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const universitiesCollection = collection(db, "Universities"); // Get universities collection
        const universitiesSnapshot = await getDocs(universitiesCollection);

        const allClubs = [];

        // Iterate over each university
        for (const universityDoc of universitiesSnapshot.docs) {
          const clubsCollection = collection(universityDoc.ref, "Clubs"); // Access the Clubs sub-collection
          const clubsSnapshot = await getDocs(clubsCollection);

          // Fetch all clubs for this university
          clubsSnapshot.docs.forEach((doc) => {
            allClubs.push({ universityId: universityDoc.id, ...doc.data() });
          });
        }

        console.log(allClubs)
        // Update the state with all clubs from all universities
        setUsers(allClubs);
      } catch (error) {
        console.error("Error fetching clubs data:", error);
      }
    };

    fetchClubs();
  }, []);

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditedData({ ClubUniversity: user.ClubUniversity, ClubName: user.ClubName });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;

    try {
      // Get reference to the specific university's Clubs sub-collection
      const universityDocRef = doc(db, "Universities", currentUser.uniId);
      const clubsCollectionRef = collection(universityDocRef, "Clubs");

      // Get the specific club document to update
      const clubDocRef = doc(clubsCollectionRef, currentUser.uid); // Assuming user.id corresponds to the club document ID

      // Update the club data in the specific university's Clubs sub-collection
      await updateDoc(clubDocRef, editedData);

      // Update the state to reflect the changes
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === currentUser.uid ? { ...user, ...editedData } : user
        )
      );

      setEditDialogOpen(false);
      setCurrentUser(null);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        // Get reference to the university's Clubs sub-collection
        const universityDocRef = doc(db, "Universities", currentUser.uniId);
        const clubsCollectionRef = collection(universityDocRef, "Clubs");

        // Delete the specific club document
        const clubDocRef = doc(clubsCollectionRef, userId);
        await deleteDoc(clubDocRef);

        // Update state to reflect the deletion
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedUniId, setSelectedUniId] = useState(null);

  const handleOpenModal = (id, uniId) => {
    setSelectedClubId(id); // Set the clubId dynamically
    setSelectedUniId(uniId); // Set the clubId dynamically
    setModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
    setSelectedClubId(null); // Reset the clubId
  };

  const isDesktop = useMediaQuery('(min-width: 1024px)'); // Adjust breakpoint as per your requirements
  const [open, setOpen] = useState(false);

  // Handlers to open and close modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <MDBox pt={6} pb={3} pl={isDesktop ? 40 : 0}>
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
                Club Management
              </MDTypography>
            </MDBox>
            <MDBox p={3}>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Profile</strong>
                      </TableCell>
                      <TableCell>
                        <strong>ID</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Club University</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Club Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                    {users.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell>
                          <img
                            src={user.ClubLogo}
                            alt=""
                            style={{ width: "50px", height: "50px" }}
                          />
                        </TableCell>
                        <TableCell>{user.uid}</TableCell>
                        <TableCell>{user.ClubUniversity}</TableCell>
                        <TableCell>{user.ClubName}</TableCell>
                        <TableCell>
                          <MDButton
                            color="success"
                            size="small"
                            onClick={() => handleEditUser(user)}
                            sx={{ mt: 1 }}
                          >
                            Edit
                          </MDButton>
                          <MDButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(user.uid)}
                            sx={{ mt: 1, ml: 2 }}
                          >
                            Delete
                          </MDButton>
                          <MDButton
                            color="warning"
                            size="small"
                            onClick={() => handleOpenModal(user.uid, user.uniId)} // Pass user.id dynamically
                            sx={{ mt: 1, ml: 2 }}
                          >
                            Show Posts
                          </MDButton>



                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Button to open the modal */}
      <button onClick={handleOpen}>Open Sidenav</button>

      {/* Modal */}
      {modalOpen && selectedClubId && (
        <PostModal open={modalOpen} onClose={handleCloseModal} clubId={selectedClubId} uniId={selectedUniId}/>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Club University"
            type="text"
            fullWidth
            value={editedData.ClubUniversity || ""}
            onChange={(e) => setEditedData((prev) => ({ ...prev, ClubUniversity: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Club Name"
            type="text"
            fullWidth
            value={editedData.ClubName || ""}
            onChange={(e) => setEditedData((prev) => ({ ...prev, ClubName: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <MDButton color="info" onClick={() => setEditDialogOpen(false)}>
            Cancel
          </MDButton>
          <MDButton color="success" onClick={handleSaveUser}>
            Save
          </MDButton>
        </DialogActions>
      </Dialog>


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

    </MDBox>
  );
};

export default ClubsTable;
