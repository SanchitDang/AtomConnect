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
import MenuIcon from '@mui/icons-material/Menu'; // Import the Menu icon
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Modal } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Sidenav2 from "../../../examples/Sidenav/index2";
import brandDark from "../../../assets/images/logo-ct-dark.png";
import brandWhite from "../../../assets/images/logo-ct.png";
import routes from "../../../routes";
import { useMaterialUIController } from "../../../context";
const db = getFirestore(firebaseApp);

const UniversitiesTable = () => {
  const [users, setUsers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editedData, setEditedData] = useState({});

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "Universities");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditedData({ uniPlace: user.uniPlace, uniName: user.uniName });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "Universities", currentUser.id), editedData);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === currentUser.id ? { ...user, ...editedData } : user
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
        await deleteDoc(doc(db, "Universities", userId));
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const isDesktop = useMediaQuery('(min-width: 1024px)'); // Adjust breakpoint as per your requirements


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
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography variant="h6" color="white">
                University Management
              </MDTypography>
              {/* Menu icon to open the sidenav */}
              {!isDesktop && (
                <MenuIcon
                  style={{ cursor: "pointer", color: "white" }}
                  onClick={handleOpen}
                />
              )}
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
                        <strong>Place</strong>
                      </TableCell>
                      <TableCell>
                        <strong>University Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <img src={user.uniLogo} alt="" style={{ width: '50px', height: '50px' }} />
                        </TableCell>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.uniPlace}</TableCell>
                        <TableCell>{user.uniName}</TableCell>
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
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{ mt: 1, ml: 2 }}
                          >
                            Delete
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Place"
            type="text"
            fullWidth
            value={editedData.uniPlace || ""}
            onChange={(e) =>
              setEditedData((prev) => ({ ...prev, uniPlace: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={editedData.uniName || ""}
            onChange={(e) =>
              setEditedData((prev) => ({ ...prev, uniName: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <MDButton
            color="info"
            onClick={() => setEditDialogOpen(false)}
          >
            Cancel
          </MDButton>
          <MDButton color="success" onClick={handleSaveUser}>
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default UniversitiesTable;
