import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  getDoc,
  addDoc,
} from "firebase/firestore";
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
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from '@mui/icons-material/Menu'; // Import the Menu icon
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Modal, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Sidenav2 from "../../../examples/Sidenav/index2";
import brandDark from "../../../assets/images/logo-ct-dark.png";
import brandWhite from "../../../assets/images/logo-ct.png";
import routes from "../../../routes";
import { useMaterialUIController } from "../../../context";
import Button from "@mui/material/Button";
const db = getFirestore(firebaseApp);
import { getDatabase, ref, push } from "firebase/database";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
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

  const [open, setOpen] = useState(false);

  // Handlers to open and close modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
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
    setEditedData({ email: user.email, display_name: user.display_name, location: user.location, bio: user.bio });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.id), editedData);
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
        await deleteDoc(doc(db, "users", userId));
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogOpenAdmin, setEditDialogOpenAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");

  const handleEditAdmin = async (user) => {
    setCurrentUser(user);
    setEditDialogOpenAdmin(true);

    try {
      // Fetch Universities and Clubs
      const uniCollection = collection(db, "Universities");
      const uniSnapshot = await getDocs(uniCollection);
      const universitiesData = await Promise.all(
        uniSnapshot.docs.map(async (doc) => {
          console.log("current user uniId")
          console.log(extractUniId(user.uniId))
          const clubsCollection = collection(db, "Universities", extractUniId(user.uniId), "Clubs");
          const clubsSnapshot = await getDocs(clubsCollection);
          const clubsData = clubsSnapshot.docs.map((clubDoc) => ({
            id: clubDoc.id,
            ...clubDoc.data(),
          }));
          setClubs(clubsData);
          console.log("clubsData");
          console.log(clubsData);
          return {
            id: doc.id,
            uniId: doc.data().uniId,
            clubs: clubsData,
          };
        })
      );

      setUniversities(universitiesData);
    } catch (error) {
      console.error("Error fetching universities and clubs:", error);
    }
  };

  const extractUniId = (uniId) => {
    const prefix = "/Universities/";
    return uniId.startsWith(prefix) ? uniId.slice(prefix.length) : null;
  };

  const handleClubSelection = (clubId) => {
    setSelectedClub(clubId);
  };

  const printClubData = async () => {
    try {
      // Extract the university ID
      const universityId = extractUniId(currentUser.uniId);

      // Reference the university document
      const universityDocRef = doc(db, "Universities", universityId);

      // Fetch the university document
      const universityDoc = await getDoc(universityDocRef);

      if (!universityDoc.exists()) {
        console.error("University not found!");
        return;
      }

      // Reference the specific club in the Clubs collection
      const clubDocRef = doc(db, "Universities", universityId, "Clubs", selectedClub);

      // Fetch the club document
      const clubDoc = await getDoc(clubDocRef);

      if (!clubDoc.exists()) {
        console.error("Club not found!");
        return;
      }

      // Add the current user to the ClubCoreMembers array
      // await updateDoc(clubDocRef, {
      //   ClubCoreMembers: arrayUnion({
      //     id: currentUser.id,
      //     displayName: currentUser.display_name,
      //   }),
      // });

      const clubDocSnapshot = await getDoc(clubDocRef);
      const clubData = clubDocSnapshot.data();

      // Check if ClubCoreMembers exists and modify the array to insert at the 0th index
      const updatedClubCoreMembers = [ // Create a new array with current member at 0th index
        { id: currentUser.id, displayName: currentUser.display_name },
        ...(clubData.ClubCoreMembers || []), // Append existing members
      ];

      // Update the document with the new array
      await updateDoc(clubDocRef, {
        ClubCoreMembers: updatedClubCoreMembers,
      });

      const userDocRef = doc(db, "users", currentUser.id); // Replace "aasdas" with the actual document ID
      try {
        await updateDoc(userDocRef, {
          admin_of: selectedClub
        });
        console.log("Field updated successfully!");
      } catch (error) {
        console.error("Error updating document: ", error);
      }

      console.log("Successfully updated ClubCoreMembers.");
      alert("Successfully updated ClubCoreMembers.");
    } catch (error) {
      console.error("Error updating club data:", error);
    }
  };

  const [editDialogOpenAdmin2, setEditDialogOpenAdmin2] = useState(false);

  const handleEditAdmin2 = async (user) => {
    setCurrentUser(user);
    setEditDialogOpenAdmin2(true);

    try {
      // Fetch Universities and Clubs
      const uniCollection = collection(db, "Universities");
      const uniSnapshot = await getDocs(uniCollection);
      const universitiesData = await Promise.all(
        uniSnapshot.docs.map(async (doc) => {
          const clubsCollection = collection(db, "Universities", extractUniId(user.uniId), "Clubs");
          const clubsSnapshot = await getDocs(clubsCollection);
          const clubsData = clubsSnapshot.docs.map((clubDoc) => ({
            id: clubDoc.id,
            ...clubDoc.data(),
          }));
          setClubs(clubsData);
          console.log("clubsData");
          console.log(clubsData);
          return {
            id: doc.id,
            uniId: doc.data().uniId,
            clubs: clubsData,
          };
        })
      );

      setUniversities(universitiesData);
    } catch (error) {
      console.error("Error fetching universities and clubs:", error);
    }
  };


  const printClubData2 = async () => {
    try {
      // Extract the university ID
      const universityId = extractUniId(currentUser.uniId);

      // Reference the university document
      const universityDocRef = doc(db, "Universities", universityId);

      // Fetch the university document
      const universityDoc = await getDoc(universityDocRef);

      if (!universityDoc.exists()) {
        console.error("University not found!");
        return;
      }

      // Reference the specific club in the Clubs collection
      const clubDocRef = doc(db, "Universities", universityId, "Clubs", selectedClub);

      // Fetch the club document
      const clubDoc = await getDoc(clubDocRef);

      if (!clubDoc.exists()) {
        console.error("Club not found!");
        return;
      }

      const newMember = { id: currentUser.id, displayName: currentUser.display_name };

      const clubDocSnapshot = await getDoc(clubDocRef);

      const clubData = clubDocSnapshot.data();

      // Modify the array to insert the new member at the 1st index
      const updatedClubCoreMembers = [
        ...(clubData.ClubCoreManagers?.slice(0, 1) || []), // Keep the member at the 0th index
        newMember, // Insert the new member at the 1st index
        ...(clubData.ClubCoreManagers?.slice(1) || []), // Append the rest of the members
      ];

      // Update the document with the new array
      await updateDoc(clubDocRef, {
        ClubCoreManagers: updatedClubCoreMembers,
      });

      // Add the current user to the ClubCoreMembers array
      // await updateDoc(clubDocRef, {
      //   ClubCoreMembers: arrayUnion({
      //     id: currentUser.id,
      //     displayName: currentUser.display_name,
      //   }),
      // });

     try {

        // Reference to the user's document in Firestore
        const userDocRef = doc(db, "users", currentUser.id);

       const managerData = await fetchManagerData(currentUser.id, db);

        // Update the manager_of field while preserving structure
        const updatedClubCoreMembersManager = [
          ...(managerData.ClubCoreManagers?.slice(0, 1) || []), // Keep the 0th member
          selectedClub, // Add the selected club at the 1st position
          ...(managerData.ClubCoreManagers?.slice(1) || []), // Append the remaining members
        ];

        // Update Firestore
        await updateDoc(userDocRef, {
          manager_of: updatedClubCoreMembersManager,
        });

        console.log("Field updated successfully!");
      } catch (error) {
        console.error("Error updating document: ", error);
      }

      console.log("Successfully updated ClubCoreMembers.");
      alert("Successfully updated ClubCoreMembers.");
    } catch (error) {
      console.error("Error updating club data:", error);
    }
  };

  async function fetchManagerData(currentUser, db) {
    try {
      // Reference the user's document in Firestore
      const userDocRef = doc(db, "users", currentUser.id);

      // Fetch the document
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Extract the manager_of field
        const managerData = userDoc.data().manager_of || [];
        console.log("Manager data:", managerData);

        return managerData;
      } else {
        console.warn("No such document found for the user.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching manager data:", error);
      return [];
    }
  }

  const isDesktop = useMediaQuery('(min-width: 1024px)'); // Adjust breakpoint as per your requirements

  const [isOpenAddUser, setIsOpenAddUser] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    course: "",
    display_name: "",
    email: "",
    location: "",
    phone_number: "",
  });

  // Handle modal toggle
  const toggleModal = () => {
    setIsOpenAddUser(!isOpenAddUser);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Add a new document to the "users" collection in Firestore
      const docRef = await addDoc(collection(db, "users"), formData);
      alert("User added successfully with ID: " + docRef.id);

      // Reset the form after successful submission
      setFormData({
        bio: "",
        course: "",
        display_name: "",
        email: "",
        location: "",
        phone_number: "",
      });

      // Close the modal
      toggleModal();
    } catch (error) {
      console.error("Error adding user:", error);
      alert("An error occurred while adding the user.");
    }
  };

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
                User Management
              </MDTypography>
              <MDButton
                color="success"
                size="small"
                onClick={toggleModal}
              >
                + Add User
              </MDButton>
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
                        <strong>Email</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <img src={user.photo_url} alt="" style={{ width: '50px', height: '50px' }} />
                        </TableCell>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.display_name}</TableCell>
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
                          <MDButton
                            color="success"
                            size="small"
                            onClick={() => handleEditAdmin(user)}
                            sx={{ mt: 1, ml: 2 }}
                          >
                            Change Club Admin
                          </MDButton>
                          <MDButton
                            color="warning"
                            size="small"
                            onClick={() => handleEditAdmin2(user)}
                            sx={{ mt: 1, ml: 2 }}
                          >
                            Change Club Manager
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
            label="Email"
            type="email"
            fullWidth
            value={editedData.email || ""}
            onChange={(e) =>
              setEditedData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={editedData.display_name || ""}
            onChange={(e) =>
              setEditedData((prev) => ({ ...prev, display_name: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Bio"
            type="text"
            fullWidth
            value={editedData.bio || ""}
            onChange={(e) =>
              setEditedData((prev) => ({ ...prev, bio: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Location"
            type="text"
            fullWidth
            value={editedData.location || ""}
            onChange={(e) =>
              setEditedData((prev) => ({ ...prev, location: e.target.value }))
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

      {/* Modal */}
      <Modal
        open={isOpenAddUser}
        onClose={toggleModal}
        aria-labelledby="add-user-modal-title"
        aria-describedby="add-user-modal-description"
      >
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
          <Typography
            id="add-user-modal-title"
            variant="h6"
            component="h3"
            sx={{ mb: 2 }}
          >
            Add New User
          </Typography>
          <form>
            <TextField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Display Name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 3,
              }}
            >
              <Button onClick={handleSubmit}>
                Submit
              </Button>
              <Button  onClick={toggleModal}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Edit Admin Dialog */}
      <Dialog open={editDialogOpenAdmin} onClose={() => setEditDialogOpenAdmin(false)}>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent>
          <text>Make Admin for:</text>
          <FormControl fullWidth margin="dense">
            <Select
              value={selectedClub}
              onChange={(e) => handleClubSelection(e.target.value)}
            >
              {clubs
                .map((club) => ( // Map over the clubs
                  <MenuItem key={club.id} value={club.id}>
                    {club.ClubName}
                  </MenuItem>
                ))}
              {/*{universities*/}
              {/*  .filter((uni) => uni.uniId === currentUser.uniId) // Filter universities first*/}
              {/*  .flatMap((uni) => uni.clubs) // Flatten clubs from the filtered universities*/}
              {/*  .map((club) => ( // Map over the clubs*/}
              {/*    <MenuItem key={club.id} value={club.id}>*/}
              {/*      {club.ClubName}*/}
              {/*    </MenuItem>*/}
              {/*  ))}*/}
            </Select>
          </FormControl>

        </DialogContent>
        <DialogActions>
          <MDButton
            color="info"
            onClick={() => setEditDialogOpenAdmin(false)}
          >
            Cancel
          </MDButton>
          <MDButton color="success" onClick={printClubData}>
            Make Admin
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Edit Admin Dialog2 */}
      <Dialog open={editDialogOpenAdmin2} onClose={() => setEditDialogOpenAdmin2(false)}>
        <DialogTitle>Add Manager</DialogTitle>
        <DialogContent>
          <text>Make Manager for:</text>
          <FormControl fullWidth margin="dense">
            <Select
              value={selectedClub}
              onChange={(e) => handleClubSelection(e.target.value)}
            >
              {clubs
                .map((club) => ( // Map over the clubs
                  <MenuItem key={club.id} value={club.id}>
                    {club.ClubName}
                  </MenuItem>
                ))}
              {/*{universities*/}
              {/*  .filter((uni) => uni.uniId === currentUser.uniId) // Filter universities first*/}
              {/*  .flatMap((uni) => uni.clubs) // Flatten clubs from the filtered universities*/}
              {/*  .map((club) => ( // Map over the clubs*/}
              {/*    <MenuItem key={club.id} value={club.id}>*/}
              {/*      {club.ClubName}*/}
              {/*    </MenuItem>*/}
              {/*  ))}*/}
            </Select>
          </FormControl>

        </DialogContent>
        <DialogActions>
          <MDButton
            color="info"
            onClick={() => setEditDialogOpenAdmin2(false)}
          >
            Cancel
          </MDButton>
          <MDButton color="success" onClick={printClubData2}>
            Make Manager
          </MDButton>
        </DialogActions>
      </Dialog>

    </MDBox>
  );
};

export default UsersTable;
