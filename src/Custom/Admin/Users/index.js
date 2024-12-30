import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc,arrayUnion, getDoc  } from "firebase/firestore";
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

const db = getFirestore(firebaseApp);

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [editedData, setEditedData] = useState({});

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
    setEditedData({ email: user.email, display_name: user.display_name });
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

      const newMember = {id: currentUser.id, displayName: currentUser.display_name};

      const clubDocSnapshot = await getDoc(clubDocRef);

      const clubData = clubDocSnapshot.data();

      // Modify the array to insert the new member at the 1st index
      const updatedClubCoreMembers = [
        ...(clubData.ClubCoreMembers?.slice(0, 1) || []), // Keep the member at the 0th index
        newMember, // Insert the new member at the 1st index
        ...(clubData.ClubCoreMembers?.slice(1) || []), // Append the rest of the members
      ];

      // Update the document with the new array
      await updateDoc(clubDocRef, {
        ClubCoreMembers: updatedClubCoreMembers,
      });

      // Add the current user to the ClubCoreMembers array
      // await updateDoc(clubDocRef, {
      //   ClubCoreMembers: arrayUnion({
      //     id: currentUser.id,
      //     displayName: currentUser.display_name,
      //   }),
      // });

      const userDocRef = doc(db, "users", currentUser.id); // Replace "aasdas" with the actual document ID
      try {
        await updateDoc(userDocRef, {
          manager_of: selectedClub
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



  return (
    <MDBox pt={6} pb={3} pl={40}>
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
                User Management
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
              {universities
                .filter((uni) => uni.uniId === currentUser.uniId) // Filter universities first
                .flatMap((uni) => uni.clubs) // Flatten clubs from the filtered universities
                .map((club) => ( // Map over the clubs
                  <MenuItem key={club.id} value={club.id}>
                    {club.ClubName}
                  </MenuItem>
                ))}
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
              {universities
                .filter((uni) => uni.uniId === currentUser.uniId) // Filter universities first
                .flatMap((uni) => uni.clubs) // Flatten clubs from the filtered universities
                .map((club) => ( // Map over the clubs
                  <MenuItem key={club.id} value={club.id}>
                    {club.ClubName}
                  </MenuItem>
                ))}
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
